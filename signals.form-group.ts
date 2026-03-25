import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  OnInit,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { debounceTime, distinctUntilChanged, finalize, map, skip, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { WorkflowDocument } from '...'; // adjust path
import { WorkflowValidationService } from '...'; // adjust path
import { CounterpartyReadService } from '...'; // adjust path
import { CounterPartyRatingsService } from '...'; // adjust path
import { ProjectFinanceCounterpartRatingResponse } from '...'; // adjust path
import { IAlert } from '...'; // adjust path

import {
  FINANCIAL_DRIVERS_ALERT_KEYS,
  FINANCIAL_DRIVERS_WARNING_ALERT_KEYS,
} from './financial-drivers-alerts';
import {
  formatComputedValue,
  hasValue,
  max21MonthsOldValidator,
  positiveStrictValidator,
  sameJson,
  setControlError,
  toApiDate,
} from './financial-drivers.utils';
import {
  FINANCIAL_DRIVERS_FORM_KEY,
  FinancialDrivers,
  FinancialUnit,
  LiquidityRisk,
  FinancialDriversComputePayload,
  FinancialDriversComputeResponse,
} from './financial-drivers.models';

type OperationCase = 'AMORTIZING' | 'BULLET';
type SecondaryRatioKey = 'dscr' | 'icr';

type OperationManualFieldKey =
  | 'juniorMezzanineGrossFinancialDebt'
  | 'equity'
  | 'quasiEquity'
  | 'cfads'
  | 'principalPaid'
  | 'interestExpenses'
  | 'ebitda'
  | 'maintenanceCapex'
  | 'taxPayments';

interface OperationManualFieldVm {
  key: OperationManualFieldKey;
  label: string;
  placeholder: string;
  positiveErrorKey?: string;
}

interface OperationCaseConfig {
  operationCase: OperationCase;
  secondaryRatioKey: SecondaryRatioKey;
  secondaryRatioLabel: string;
  secondaryRatioAnchorId: SecondaryRatioKey;
  manualFields: OperationManualFieldVm[];
}

interface SelectItem {
  label: string;
  value: string;
}

interface CurrencyItem {
  value: string;
  displayValue: string;
}

interface OperationFinancialDriversFormModel {
  unit: FormControl<FinancialUnit | null>;
  currency: FormControl<string | null>;
  closingDate: FormControl<Date | null>;

  seniorGrossFinancialDebt: FormControl<number | null>;
  juniorMezzanineGrossFinancialDebt: FormControl<number | null>;
  equity: FormControl<number | null>;
  quasiEquity: FormControl<number | null>;
  interestExpenses: FormControl<number | null>;

  cfads: FormControl<number | null>;
  principalPaid: FormControl<number | null>;

  ebitda: FormControl<number | null>;
  maintenanceCapex: FormControl<number | null>;
  taxPayments: FormControl<number | null>;

  debtToEquity: FormControl<number | null>;
  dscr: FormControl<number | null>;
  icr: FormControl<number | null>;

  adjustedDebtToEquity: FormControl<number | null>;
  adjustedDebtToEquityClosingDate: FormControl<Date | null>;
  adjustedDebtToEquityComment: FormControl<string | null>;

  adjustedDscrIcr: FormControl<number | null>;
  adjustedDscrIcrClosingDate: FormControl<Date | null>;
  adjustedDscrIcrComment: FormControl<string | null>;

  liquidityRisk: FormControl<LiquidityRisk | null>;
}

type OperationFinancialDriversFormGroup = FormGroup<OperationFinancialDriversFormModel>;

@Component({
  selector: 'bnpp-financial-drivers-operation',
  templateUrl: './financial-drivers-operation.component.html',
  styleUrls: ['./financial-drivers-operation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversOperationComponent implements OnInit {
  readonly ratingForm = input.required<FormGroup>();
  readonly workflowDTO = input.required<WorkflowDocument>();
  readonly rmpId = input.required<string>();
  readonly validationInProgress = input<boolean>(false);
  readonly operationCase = input.required<OperationCase>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly counterPartyRatingsService = inject(CounterPartyRatingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly workflowValidationService = inject(WorkflowValidationService);
  readonly counterpartyReadService: CounterpartyReadService = inject(CounterpartyReadService);

  readonly referenceCurrencyUnitList: SelectItem[] = [
    { label: 'Unit', value: 'UNIT' },
    { label: 'Thousand', value: 'THOUSAND' },
    { label: 'Million', value: 'MILLION' },
    { label: 'Billion', value: 'BILLION' },
    { label: 'Trillion', value: 'TRILLION' },
  ];

  readonly liquidityRiskList: SelectItem[] = [
    { label: 'Excellent (> 12 months of debt service)', value: 'EXCELLENT' },
    { label: 'Good (6 - 12 months of debt service)', value: 'GOOD' },
    { label: 'Limited (< 6 months of debt service)', value: 'LIMITED' },
  ];

  readonly operationForm: OperationFinancialDriversFormGroup =
    this.formBuilder.group<OperationFinancialDriversFormModel>(
      {
        unit: this.formBuilder.control<FinancialUnit | null>(null),
        currency: this.formBuilder.control<string | null>(null),
        closingDate: this.formBuilder.control<Date | null>(null, {
          validators: [max21MonthsOldValidator(FINANCIAL_DRIVERS_ALERT_KEYS.closingDate21Months)],
        }),

        seniorGrossFinancialDebt: this.formBuilder.control<number | null>(null),
        juniorMezzanineGrossFinancialDebt: this.formBuilder.control<number | null>(null),
        equity: this.formBuilder.control<number | null>(null),
        quasiEquity: this.formBuilder.control<number | null>(null),
        interestExpenses: this.formBuilder.control<number | null>(null, {
          validators: [
            positiveStrictValidator(FINANCIAL_DRIVERS_ALERT_KEYS.interestExpensesPositive),
          ],
        }),

        cfads: this.formBuilder.control<number | null>(null),
        principalPaid: this.formBuilder.control<number | null>(null, {
          validators: [
            positiveStrictValidator(FINANCIAL_DRIVERS_ALERT_KEYS.principalPaidPositive),
          ],
        }),

        ebitda: this.formBuilder.control<number | null>(null),
        maintenanceCapex: this.formBuilder.control<number | null>(null, {
          validators: [
            positiveStrictValidator(FINANCIAL_DRIVERS_ALERT_KEYS.maintenanceCapexPositive),
          ],
        }),
        taxPayments: this.formBuilder.control<number | null>(null),

        debtToEquity: this.formBuilder.control<number | null>(null),
        dscr: this.formBuilder.control<number | null>(null),
        icr: this.formBuilder.control<number | null>(null),

        adjustedDebtToEquity: this.formBuilder.control<number | null>(null),
        adjustedDebtToEquityClosingDate: this.formBuilder.control<Date | null>(null, {
          validators: [
            max21MonthsOldValidator(FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquity21Months),
          ],
        }),
        adjustedDebtToEquityComment: this.formBuilder.control<string | null>(null),

        adjustedDscrIcr: this.formBuilder.control<number | null>(null),
        adjustedDscrIcrClosingDate: this.formBuilder.control<Date | null>(null, {
          validators: [
            max21MonthsOldValidator(FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcr21Months),
          ],
        }),
        adjustedDscrIcrComment: this.formBuilder.control<string | null>(null),

        liquidityRisk: this.formBuilder.control<LiquidityRisk | null>(null),
      },
      {
        validators: [
          this.manualSectionRequiredValidator(),
          this.adjustedDebtToEquityValidator(),
          this.adjustedDscrIcrValidator(),
        ],
      },
    );

  readonly formValue = signal(this.operationForm.getRawValue());

  readonly projectFinanceCounterpartRating = computed<ProjectFinanceCounterpartRatingResponse | null>(
    () => {
      return (this.workflowDTO().counterPartyRating as ProjectFinanceCounterpartRatingResponse) ?? null;
    },
  );

  readonly isAmortizing = computed(() => this.operationCase() === 'AMORTIZING');
  readonly isBullet = computed(() => this.operationCase() === 'BULLET');

  readonly operationConfig = computed<OperationCaseConfig>(() => {
    if (this.operationCase() === 'AMORTIZING') {
      return {
        operationCase: 'AMORTIZING',
        secondaryRatioKey: 'dscr',
        secondaryRatioLabel: 'DSCR',
        secondaryRatioAnchorId: 'dscr',
        manualFields: [
          {
            key: 'juniorMezzanineGrossFinancialDebt',
            label: $localize`:@@financialDriversJuniorMezzanineGrossFinancialDebtLabel:Junior/Mezzanine Gross Financial Debt`,
            placeholder: $localize`:@@financialDriversJuniorMezzanineGrossFinancialDebtLabel:Junior/Mezzanine Gross Financial Debt`,
          },
          {
            key: 'equity',
            label: $localize`:@@financialDriversEquityLabel:Fonds Propres`,
            placeholder: $localize`:@@financialDriversEquityLabel:Fonds Propres`,
          },
          {
            key: 'quasiEquity',
            label: $localize`:@@financialDriversQuasiEquityLabel:Quasi-fonds Propres`,
            placeholder: $localize`:@@financialDriversQuasiEquityLabel:Quasi-fonds Propres`,
          },
          {
            key: 'cfads',
            label: $localize`:@@financialDriversCfadsLabel:CFADS`,
            placeholder: $localize`:@@financialDriversCfadsLabel:CFADS`,
          },
          {
            key: 'principalPaid',
            label: $localize`:@@financialDriversPrincipalPaidLabel:Principal Paid`,
            placeholder: $localize`:@@financialDriversPrincipalPaidLabel:Principal Paid`,
            positiveErrorKey: FINANCIAL_DRIVERS_ALERT_KEYS.principalPaidPositive,
          },
          {
            key: 'interestExpenses',
            label: $localize`:@@financialDriversInterestExpensesLabel:Interest Expenses`,
            placeholder: $localize`:@@financialDriversInterestExpensesLabel:Interest Expenses`,
            positiveErrorKey: FINANCIAL_DRIVERS_ALERT_KEYS.interestExpensesPositive,
          },
        ],
      };
    }

    return {
      operationCase: 'BULLET',
      secondaryRatioKey: 'icr',
      secondaryRatioLabel: 'ICR',
      secondaryRatioAnchorId: 'icr',
      manualFields: [
        {
          key: 'juniorMezzanineGrossFinancialDebt',
          label: $localize`:@@financialDriversJuniorMezzanineGrossFinancialDebtLabel:Junior/Mezzanine Gross Financial Debt`,
          placeholder: $localize`:@@financialDriversJuniorMezzanineGrossFinancialDebtLabel:Junior/Mezzanine Gross Financial Debt`,
        },
        {
          key: 'equity',
          label: $localize`:@@financialDriversEquityLabel:Fonds Propres`,
          placeholder: $localize`:@@financialDriversEquityLabel:Fonds Propres`,
        },
        {
          key: 'quasiEquity',
          label: $localize`:@@financialDriversQuasiEquityLabel:Quasi-fonds Propres`,
          placeholder: $localize`:@@financialDriversQuasiEquityLabel:Quasi-fonds Propres`,
        },
        {
          key: 'interestExpenses',
          label: $localize`:@@financialDriversInterestExpensesLabel:Interest Expenses`,
          placeholder: $localize`:@@financialDriversInterestExpensesLabel:Interest Expenses`,
          positiveErrorKey: FINANCIAL_DRIVERS_ALERT_KEYS.interestExpensesPositive,
        },
        {
          key: 'ebitda',
          label: $localize`:@@financialDriversEbitdaLabel:EBITDA`,
          placeholder: $localize`:@@financialDriversEbitdaLabel:EBITDA`,
        },
        {
          key: 'maintenanceCapex',
          label: $localize`:@@financialDriversMaintenanceCapexLabel:Maintenance Capex`,
          placeholder: $localize`:@@financialDriversMaintenanceCapexLabel:Maintenance Capex`,
          positiveErrorKey: FINANCIAL_DRIVERS_ALERT_KEYS.maintenanceCapexPositive,
        },
        {
          key: 'taxPayments',
          label: $localize`:@@financialDriversTaxPaymentsLabel:Tax Payments`,
          placeholder: $localize`:@@financialDriversTaxPaymentsLabel:Tax Payments`,
        },
      ],
    };
  });

  readonly manualFields = computed(() => this.operationConfig().manualFields);

  readonly currenciesResponse = toSignal(
    this.counterpartyReadService.fetchAllCurrency().pipe(
      map((response: unknown) => (Array.isArray(response) ? response : [])),
    ),
    { initialValue: [] as CurrencyItem[] },
  );

  readonly currencyList = computed<SelectItem[]>(() => {
    return this.currenciesResponse().map((currency) => ({
      label: currency.displayValue,
      value: currency.value,
    }));
  });

  readonly filteredCurrencyList = signal<SelectItem[]>([]);

  readonly selectedUnitLabel = computed(() => {
    const value = this.formValue().unit;
    return this.referenceCurrencyUnitList.find((item) => item.value === value)?.label ?? '-';
  });

  readonly selectedCurrencyValue = computed(() => this.formValue().currency);

  readonly selectedCurrencyLabel = computed(() => {
    const selectedValue = this.selectedCurrencyValue();
    const currencies = this.currencyList();

    if (!selectedValue) {
      return '-';
    }

    return currencies.find((currency) => currency.value === selectedValue)?.label ?? selectedValue;
  });

  readonly liquidityRiskLabel = computed(() => {
    const value = this.formValue().liquidityRisk;
    return this.liquidityRiskList.find((item) => item.value === value)?.label ?? '-';
  });

  readonly hasAdjustedDebtToEquity = computed(() => hasValue(this.formValue().adjustedDebtToEquity));
  readonly hasAdjustedDscrIcr = computed(() => hasValue(this.formValue().adjustedDscrIcr));

  readonly debtToEquityDisplay = computed(() =>
    formatComputedValue(this.operationForm.controls.debtToEquity.value, this.hasComputeError()),
  );

  readonly secondaryRatioDisplay = computed(() => {
    const key = this.operationConfig().secondaryRatioKey;
    return formatComputedValue(this.operationForm.controls[key].value, this.hasComputeError());
  });

  readonly computedPayload = computed<FinancialDriversComputePayload>(() => {
    const formValue = this.formValue();
    const rating = this.projectFinanceCounterpartRating();
    const rmpId = this.rmpId();

    return {
      financialDriverComputeType: this.operationCase(),
      rmpId,

      projectPhase: rating?.projectPhaseInfo?.projectPhase ?? null,
      technicalRisk: rating?.projectPhaseInfo?.technicalRisk ?? null,
      countryCode: rating?.countryOfBusiness?.code ?? null,
      pmoRisk: rating?.projectPhaseInfo?.pmoRisk ?? null,
      hasProjectSponsor: rating?.projectPhaseInfo?.hasSponsor ?? false,

      sponsorType: null,
      sponsorTurnover: null,
      sponsorInvolvement: null,

      unit: formValue.unit,
      currency: formValue.currency,
      closingDate: toApiDate(formValue.closingDate),

      seniorGrossFinancialDebt: formValue.seniorGrossFinancialDebt,
      juniorMezzanineGrossFinancialDebt: formValue.juniorMezzanineGrossFinancialDebt,
      equity: formValue.equity,
      quasiEquity: formValue.quasiEquity,
      interestExpenses: formValue.interestExpenses,

      cfads: this.isAmortizing() ? formValue.cfads : null,
      principalPaid: this.isAmortizing() ? formValue.principalPaid : null,

      ebitda: this.isBullet() ? formValue.ebitda : null,
      maintenanceCapex: this.isBullet() ? formValue.maintenanceCapex : null,
      taxPayments: this.isBullet() ? formValue.taxPayments : null,
    };
  });

  readonly canCompute = computed(() => {
    const payload = this.computedPayload();

    const commonValues = [
      payload.unit,
      payload.currency,
      payload.closingDate,
      payload.seniorGrossFinancialDebt,
      payload.juniorMezzanineGrossFinancialDebt,
      payload.equity,
      payload.quasiEquity,
      payload.interestExpenses,
    ];

    const specificValues = this.isAmortizing()
      ? [payload.cfads, payload.principalPaid]
      : [payload.ebitda, payload.maintenanceCapex, payload.taxPayments];

    return [...commonValues, ...specificValues].every(hasValue);
  });

  readonly isComputing = signal(false);
  readonly hasComputeError = signal(false);

  readonly computedPayload$ = toObservable(this.computedPayload, {
    injector: this.injector,
  });

  readonly warningEffect = effect(() => {
    const validationTriggered = this.validationInProgress();
    this.formValue();

    if (!validationTriggered) {
      this.clearWarnings();
      return;
    }

    this.updateOperationWarnings();
  });

  ngOnInit(): void {
    this.filteredCurrencyList.set(this.currencyList());
    this.initFormValues();
    this.registerFormToParent();
    this.listenToFormChanges();
    this.listenToComputedFieldsChanges();
  }

  private registerFormToParent(): void {
    this.ratingForm().setControl(FINANCIAL_DRIVERS_FORM_KEY, this.operationForm);
  }

  private listenToFormChanges(): void {
    this.operationForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formValue.set(this.operationForm.getRawValue());
      });
  }

  private initFormValues(): void {
    const financialDrivers = this.projectFinanceCounterpartRating()?.financialDrivers;

    if (!financialDrivers) {
      return;
    }

    this.operationForm.patchValue(
      {
        unit: financialDrivers.unit,
        currency: financialDrivers.currency,
        closingDate: financialDrivers.closingDate ? new Date(financialDrivers.closingDate) : null,

        seniorGrossFinancialDebt: financialDrivers.seniorGrossFinancialDebt,
        juniorMezzanineGrossFinancialDebt: financialDrivers.juniorMezzanineGrossFinancialDebt,
        equity: financialDrivers.equity,
        quasiEquity: financialDrivers.quasiEquity,
        interestExpenses: financialDrivers.interestExpenses,

        cfads: financialDrivers.cfads,
        principalPaid: financialDrivers.principalPaid,

        ebitda: financialDrivers.ebitda,
        maintenanceCapex: financialDrivers.maintenanceCapex,
        taxPayments: financialDrivers.taxPayments,

        debtToEquity: financialDrivers.debtToEquity,
        dscr: financialDrivers.dscr,
        icr: financialDrivers.icr,

        adjustedDebtToEquity: financialDrivers.adjustedDebtToEquity,
        adjustedDebtToEquityClosingDate: financialDrivers.adjustedDebtToEquityClosingDate
          ? new Date(financialDrivers.adjustedDebtToEquityClosingDate)
          : null,
        adjustedDebtToEquityComment: financialDrivers.adjustedDebtToEquityComment,

        adjustedDscrIcr: financialDrivers.adjustedDscrIcr,
        adjustedDscrIcrClosingDate: financialDrivers.adjustedDscrIcrClosingDate
          ? new Date(financialDrivers.adjustedDscrIcrClosingDate)
          : null,
        adjustedDscrIcrComment: financialDrivers.adjustedDscrIcrComment,

        liquidityRisk: financialDrivers.liquidityRisk,
      },
      { emitEvent: false },
    );

    this.formValue.set(this.operationForm.getRawValue());
  }

  private listenToComputedFieldsChanges(): void {
    this.computedPayload$
      .pipe(
        skip(1),
        debounceTime(2000),
        distinctUntilChanged(sameJson),
        tap(() => {
          if (!this.canCompute()) {
            this.clearComputedFields();
            this.hasComputeError.set(false);
            return;
          }

          this.isComputing.set(true);
          this.hasComputeError.set(false);
        }),
        switchMap((payload) =>
          this.counterPartyRatingsService
            .computeFinancialDriversMock(
              payload as FinancialDriversComputePayload,
              this.operationCase(),
            )
            .pipe(
              finalize(() => {
                this.isComputing.set(false);
              }),
              tap((response: FinancialDriversComputeResponse) => {
                this.patchComputedFields(response);
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => {
          this.isComputing.set(false);
          this.hasComputeError.set(true);
          this.clearComputedFields();
        },
      });
  }

  private patchComputedFields(response: FinancialDriversComputeResponse): void {
    this.hasComputeError.set(!!response.hasCalculationError);

    const patch: Partial<ReturnType<OperationFinancialDriversFormGroup['getRawValue']>> = {
      debtToEquity: response.hasCalculationError ? null : response.debtToEquity,
      liquidityRisk: response.liquidityRisk,
    };

    if (this.isAmortizing()) {
      patch.dscr = response.hasCalculationError ? null : response.dscr;
      patch.icr = null;
    } else {
      patch.icr = response.hasCalculationError ? null : response.icr;
      patch.dscr = null;
    }

    this.operationForm.patchValue(patch, { emitEvent: false });
    this.formValue.set(this.operationForm.getRawValue());
  }

  private clearComputedFields(): void {
    this.operationForm.patchValue(
      {
        debtToEquity: null,
        dscr: null,
        icr: null,
      },
      { emitEvent: false },
    );

    this.formValue.set(this.operationForm.getRawValue());
  }

  getControl(key: OperationManualFieldKey) {
    return this.operationForm.controls[key];
  }

  onSearchCurrencies(searchValue: string): void {
    if (!this.currencyList().length) {
      return;
    }

    const normalized = (searchValue ?? '').trim().toUpperCase();

    if (!normalized) {
      this.filteredCurrencyList.set(this.currencyList());
      return;
    }

    this.filteredCurrencyList.set(
      this.currencyList().filter((currency) =>
        currency.label.toUpperCase().includes(normalized),
      ),
    );
  }

  private updateOperationWarnings(): void {
    this.clearWarnings();

    const raw = this.operationForm.getRawValue();
    const alerts: IAlert[] = [];

    if (!hasValue(raw.debtToEquity)) {
      alerts.push({
        alertTextId: FINANCIAL_DRIVERS_WARNING_ALERT_KEYS.debtToEquityWarningMessage,
        fragmentId: 'financialDrivers',
        anchorId: 'debtToEquity',
      });
    }

    const secondaryRatioKey = this.operationConfig().secondaryRatioAnchorId;
    const secondaryRatioValue = raw[secondaryRatioKey];

    if (!hasValue(secondaryRatioValue)) {
      alerts.push({
        alertTextId: FINANCIAL_DRIVERS_WARNING_ALERT_KEYS.dscrIcrWarningMessage,
        fragmentId: 'financialDrivers',
        anchorId: secondaryRatioKey,
      });
    }

    if (alerts.length) {
      this.workflowValidationService.addWorkflowAlerts('warnings', alerts);
    }
  }

  private clearWarnings(): void {
    this.workflowValidationService.clearAlertsByFragmentId('warnings', 'financialDrivers');
  }

  private currentManualSectionKeys(): OperationManualFieldKey[] {
    return this.manualFields().map((field) => field.key);
  }

  private manualSectionRequiredValidator(): ValidatorFn {
    return (control): ValidationErrors | null => {
      const form = control as OperationFinancialDriversFormGroup;
      const raw = form.getRawValue();

      const hasAtLeastOneManualFieldFilled = this.currentManualSectionKeys().some((key) =>
        hasValue(raw[key]),
      );

      setControlError(
        form.controls.unit,
        FINANCIAL_DRIVERS_ALERT_KEYS.unitRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(raw.unit),
      );

      setControlError(
        form.controls.currency,
        FINANCIAL_DRIVERS_ALERT_KEYS.currencyRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(raw.currency),
      );

      setControlError(
        form.controls.closingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.closingDateRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(raw.closingDate),
      );

      return null;
    };
  }

  private adjustedDebtToEquityValidator(): ValidatorFn {
    return (control): ValidationErrors | null => {
      const form = control as OperationFinancialDriversFormGroup;
      const raw = form.getRawValue();

      const shouldValidate = hasValue(raw.adjustedDebtToEquity);

      setControlError(
        form.controls.adjustedDebtToEquityClosingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityClosingDateRequired,
        shouldValidate && !hasValue(raw.adjustedDebtToEquityClosingDate),
      );

      setControlError(
        form.controls.adjustedDebtToEquityComment,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityCommentRequired,
        shouldValidate && !hasValue(raw.adjustedDebtToEquityComment),
      );

      return null;
    };
  }

  private adjustedDscrIcrValidator(): ValidatorFn {
    return (control): ValidationErrors | null => {
      const form = control as OperationFinancialDriversFormGroup;
      const raw = form.getRawValue();

      const shouldValidate = hasValue(raw.adjustedDscrIcr);

      setControlError(
        form.controls.adjustedDscrIcrClosingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrClosingDateRequired,
        shouldValidate && !hasValue(raw.adjustedDscrIcrClosingDate),
      );

      setControlError(
        form.controls.adjustedDscrIcrComment,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrCommentRequired,
        shouldValidate && !hasValue(raw.adjustedDscrIcrComment),
      );

      return null;
    };
  }
}
