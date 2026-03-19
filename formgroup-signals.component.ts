import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== '';
}

export function setControlError(
  control: AbstractControl | null,
  errorKey: string,
  shouldSet: boolean,
): void {
  if (!control) {
    return;
  }

  const currentErrors = control.errors ?? {};

  if (shouldSet) {
    if (!currentErrors[errorKey]) {
      control.setErrors({ ...currentErrors, [errorKey]: true });
    }
    return;
  }

  if (!currentErrors[errorKey]) {
    return;
  }

  const { [errorKey]: _, ...remainingErrors } = currentErrors;
  control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
}

export function positiveStrictValidator(errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!hasValue(value)) {
      return null;
    }

    return Number(value) > 0 ? null : { [errorKey]: true };
  };
}

export function max21MonthsOldValidator(errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as Date | null;

    if (!value) {
      return null;
    }

    const inputDate = new Date(value);
    if (Number.isNaN(inputDate.getTime())) {
      return null;
    }

    const today = new Date();
    const limitDate = new Date(today);
    limitDate.setMonth(today.getMonth() - 21);

    return inputDate < limitDate ? { [errorKey]: true } : null;
  };
}

export function toDate(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function toApiDate(value: Date | null): string | null {
  if (!value) {
    return null;
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function formatComputedValue(value: number | null, displaySlash: boolean): string {
  if (value === null || value === undefined) {
    return displaySlash ? '/' : '';
  }

  return String(value);
}


////

//commented model
export interface FinancialDrivers {
  // shared / persisted
  closingDate: string | null;
  liquidityRisk: LiquidityRisk | null;

  // construction + computed for other cases
  debtToEquity: number | null;

  // early operation / operation common inputs
  unit: FinancialUnit | null;
  currency: string | null;
  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  interestExpenses: number | null;

  // amortizing only
  cfads: number | null;
  principalPaid: number | null;
  dscr: number | null;

  // bullet only
  ebitda: number | null;
  maintenanceCapex: number | null;
  taxPayments: number | null;
  icr: number | null;

  // common override fields for amortizing / bullet
  adjustedDebtToEquity: number | null;
  adjustedDebtToEquityClosingDate: string | null;
  adjustedDebtToEquityComment: string | null;

  adjustedDscrIcr: number | null;
  adjustedDscrIcrClosingDate: string | null;
  adjustedDscrIcrComment: string | null;
}


///

import { FormControl, FormGroup } from '@angular/forms';

export type NullableNumber = number | null;

export type FinancialDriversCase =
  | 'CONSTRUCTION'
  | 'AMORTIZING'
  | 'BULLET';

export type FinancialUnit =
  | 'UNIT'
  | 'THOUSAND'
  | 'MILLION'
  | 'BILLION'
  | 'TRILLION';

export type LiquidityRisk =
  | 'EXCELLENT'
  | 'GOOD'
  | 'LIMITED';

export const FINANCIAL_DRIVERS_FORM_KEY = 'financialDrivers';

export interface FinancialDrivers {
  closingDate: string | null;
  liquidityRisk: LiquidityRisk | null;

  debtToEquity: number | null;

  unit: FinancialUnit | null;
  currency: string | null;
  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  interestExpenses: number | null;

  cfads: number | null;
  principalPaid: number | null;
  dscr: number | null;

  ebitda: number | null;
  maintenanceCapex: number | null;
  taxPayments: number | null;
  icr: number | null;

  adjustedDebtToEquity: number | null;
  adjustedDebtToEquityClosingDate: string | null;
  adjustedDebtToEquityComment: string | null;

  adjustedDscrIcr: number | null;
  adjustedDscrIcrClosingDate: string | null;
  adjustedDscrIcrComment: string | null;
}

export interface ConstructionFinancialDriversFormModel {
  closingDate: FormControl<Date | null>;
  debtToEquity: FormControl<NullableNumber>;
  liquidityRisk: FormControl<LiquidityRisk | null>;
}

export type ConstructionFinancialDriversFormGroup =
  FormGroup<ConstructionFinancialDriversFormModel>;

export interface AmortizingFinancialDriversFormModel {
  unit: FormControl<FinancialUnit | null>;
  currency: FormControl<string | null>;
  closingDate: FormControl<Date | null>;

  seniorGrossFinancialDebt: FormControl<NullableNumber>;
  juniorMezzanineGrossFinancialDebt: FormControl<NullableNumber>;
  equity: FormControl<NullableNumber>;
  quasiEquity: FormControl<NullableNumber>;
  cfads: FormControl<NullableNumber>;
  principalPaid: FormControl<NullableNumber>;
  interestExpenses: FormControl<NullableNumber>;

  debtToEquity: FormControl<NullableNumber>;
  dscr: FormControl<NullableNumber>;

  adjustedDebtToEquity: FormControl<NullableNumber>;
  adjustedDebtToEquityClosingDate: FormControl<Date | null>;
  adjustedDebtToEquityComment: FormControl<string | null>;

  adjustedDscrIcr: FormControl<NullableNumber>;
  adjustedDscrIcrClosingDate: FormControl<Date | null>;
  adjustedDscrIcrComment: FormControl<string | null>;

  liquidityRisk: FormControl<LiquidityRisk | null>;
}

export type AmortizingFinancialDriversFormGroup =
  FormGroup<AmortizingFinancialDriversFormModel>;

export interface BulletFinancialDriversFormModel {
  unit: FormControl<FinancialUnit | null>;
  currency: FormControl<string | null>;
  closingDate: FormControl<Date | null>;

  seniorGrossFinancialDebt: FormControl<NullableNumber>;
  juniorMezzanineGrossFinancialDebt: FormControl<NullableNumber>;
  equity: FormControl<NullableNumber>;
  quasiEquity: FormControl<NullableNumber>;
  interestExpenses: FormControl<NullableNumber>;
  ebitda: FormControl<NullableNumber>;
  maintenanceCapex: FormControl<NullableNumber>;
  taxPayments: FormControl<NullableNumber>;

  debtToEquity: FormControl<NullableNumber>;
  icr: FormControl<NullableNumber>;

  adjustedDebtToEquity: FormControl<NullableNumber>;
  adjustedDebtToEquityClosingDate: FormControl<Date | null>;
  adjustedDebtToEquityComment: FormControl<string | null>;

  adjustedDscrIcr: FormControl<NullableNumber>;
  adjustedDscrIcrClosingDate: FormControl<Date | null>;
  adjustedDscrIcrComment: FormControl<string | null>;

  liquidityRisk: FormControl<LiquidityRisk | null>;
}

export type BulletFinancialDriversFormGroup =
  FormGroup<BulletFinancialDriversFormModel>;

export interface AmortizingFinancialDriversComputePayload {
  unit: FinancialUnit | null;
  currency: string | null;
  closingDate: string | null;
  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  cfads: number | null;
  principalPaid: number | null;
  interestExpenses: number | null;
}

export interface AmortizingFinancialDriversComputeResponse {
  debtToEquity: number | null;
  dscr: number | null;
  hasCalculationError?: boolean;
}

export interface BulletFinancialDriversComputePayload {
  unit: FinancialUnit | null;
  currency: string | null;
  closingDate: string | null;
  seniorGrossFinancialDebt: number | null;
  juniorMezzanineGrossFinancialDebt: number | null;
  equity: number | null;
  quasiEquity: number | null;
  interestExpenses: number | null;
  ebitda: number | null;
  maintenanceCapex: number | null;
  taxPayments: number | null;
}

export interface BulletFinancialDriversComputeResponse {
  debtToEquity: number | null;
  icr: number | null;
  hasCalculationError?: boolean;
}

/////


export const FINANCIAL_DRIVERS_ALERT_KEYS = {
  unitRequired: 'financialDriversUnitRequired',
  currencyRequired: 'financialDriversCurrencyRequired',
  closingDateRequired: 'financialDriversClosingDateRequired',
  closingDate21Months: 'financialDriversClosingDate21Months',

  principalPaidPositive: 'financialDriversPrincipalPaidPositive',
  interestExpensesPositive: 'financialDriversInterestExpensesPositive',
  maintenanceCapexPositive: 'financialDriversMaintenanceCapexPositive',

  adjustedDebtToEquityClosingDateRequired:
    'financialDriversAdjustedDebtToEquityClosingDateRequired',
  adjustedDebtToEquityCommentRequired:
    'financialDriversAdjustedDebtToEquityCommentRequired',
  adjustedDebtToEquity21Months:
    'financialDriversAdjustedDebtToEquity21Months',

  adjustedDscrIcrClosingDateRequired:
    'financialDriversAdjustedDscrIcrClosingDateRequired',
  adjustedDscrIcrCommentRequired:
    'financialDriversAdjustedDscrIcrCommentRequired',
  adjustedDscrIcr21Months:
    'financialDriversAdjustedDscrIcr21Months',
} as const;


/////

import {
  ConstructionFinancialDriversFormGroup,
  AmortizingFinancialDriversFormGroup,
  BulletFinancialDriversFormGroup,
  FinancialDrivers,
} from './financial-drivers.models';
import { toApiDate } from './financial-drivers.utils';

export function mapConstructionFormToFinancialDrivers(
  form: ConstructionFinancialDriversFormGroup,
): Partial<FinancialDrivers> {
  const raw = form.getRawValue();

  return {
    closingDate: toApiDate(raw.closingDate),
    debtToEquity: raw.debtToEquity,
    liquidityRisk: raw.liquidityRisk,
  };
}

export function mapAmortizingFormToFinancialDrivers(
  form: AmortizingFinancialDriversFormGroup,
): Partial<FinancialDrivers> {
  const raw = form.getRawValue();

  return {
    unit: raw.unit,
    currency: raw.currency,
    closingDate: toApiDate(raw.closingDate),

    seniorGrossFinancialDebt: raw.seniorGrossFinancialDebt,
    juniorMezzanineGrossFinancialDebt: raw.juniorMezzanineGrossFinancialDebt,
    equity: raw.equity,
    quasiEquity: raw.quasiEquity,
    cfads: raw.cfads,
    principalPaid: raw.principalPaid,
    interestExpenses: raw.interestExpenses,

    debtToEquity: raw.debtToEquity,
    dscr: raw.dscr,

    adjustedDebtToEquity: raw.adjustedDebtToEquity,
    adjustedDebtToEquityClosingDate: toApiDate(raw.adjustedDebtToEquityClosingDate),
    adjustedDebtToEquityComment: raw.adjustedDebtToEquityComment,

    adjustedDscrIcr: raw.adjustedDscrIcr,
    adjustedDscrIcrClosingDate: toApiDate(raw.adjustedDscrIcrClosingDate),
    adjustedDscrIcrComment: raw.adjustedDscrIcrComment,

    liquidityRisk: raw.liquidityRisk,
  };
}

export function mapBulletFormToFinancialDrivers(
  form: BulletFinancialDriversFormGroup,
): Partial<FinancialDrivers> {
  const raw = form.getRawValue();

  return {
    unit: raw.unit,
    currency: raw.currency,
    closingDate: toApiDate(raw.closingDate),

    seniorGrossFinancialDebt: raw.seniorGrossFinancialDebt,
    juniorMezzanineGrossFinancialDebt: raw.juniorMezzanineGrossFinancialDebt,
    equity: raw.equity,
    quasiEquity: raw.quasiEquity,
    interestExpenses: raw.interestExpenses,
    ebitda: raw.ebitda,
    maintenanceCapex: raw.maintenanceCapex,
    taxPayments: raw.taxPayments,

    debtToEquity: raw.debtToEquity,
    icr: raw.icr,

    adjustedDebtToEquity: raw.adjustedDebtToEquity,
    adjustedDebtToEquityClosingDate: toApiDate(raw.adjustedDebtToEquityClosingDate),
    adjustedDebtToEquityComment: raw.adjustedDebtToEquityComment,

    adjustedDscrIcr: raw.adjustedDscrIcr,
    adjustedDscrIcrClosingDate: toApiDate(raw.adjustedDscrIcrClosingDate),
    adjustedDscrIcrComment: raw.adjustedDscrIcrComment,

    liquidityRisk: raw.liquidityRisk,
  };
}


///

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AmortizingFinancialDriversComputePayload,
  AmortizingFinancialDriversComputeResponse,
  BulletFinancialDriversComputePayload,
  BulletFinancialDriversComputeResponse,
} from './financial-drivers.models';

@Injectable({ providedIn: 'root' })
export class FinancialDriversApiService {
  private readonly http = inject(HttpClient);

  computeAmortizingFinancialDrivers(
    payload: AmortizingFinancialDriversComputePayload,
  ): Observable<AmortizingFinancialDriversComputeResponse> {
    return this.http.post<AmortizingFinancialDriversComputeResponse>(
      '/api/project-finance/financial-drivers/amortizing/compute',
      payload,
    );
  }

  computeBulletFinancialDrivers(
    payload: BulletFinancialDriversComputePayload,
  ): Observable<BulletFinancialDriversComputeResponse> {
    return this.http.post<BulletFinancialDriversComputeResponse>(
      '/api/project-finance/financial-drivers/bullet/compute',
      payload,
    );
  }
}

////


import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

import { WorkflowDocument } from '...'; // adjust path
import { ProjectFinanceCounterpartRatingResponse } from '...'; // adjust path

import {
  ConstructionFinancialDriversFormGroup,
  ConstructionFinancialDriversFormModel,
  FINANCIAL_DRIVERS_FORM_KEY,
  FinancialDrivers,
  LiquidityRisk,
  NullableNumber,
} from './financial-drivers.models';
import { FINANCIAL_DRIVERS_ALERT_KEYS } from './financial-drivers-alerts';
import {
  formatComputedValue,
  max21MonthsOldValidator,
  toDate,
} from './financial-drivers.utils';

@Component({
  selector: 'bnpp-financial-drivers-construction',
  templateUrl: './financial-drivers-construction.component.html',
  styleUrls: ['./financial-drivers-construction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversConstructionComponent implements OnInit {
  readonly ratingForm = input.required<FormGroup>();
  readonly workflowDTO = input.required<WorkflowDocument>();
  readonly validationInProgress = input<boolean>(false);

  private readonly formBuilder = inject(FormBuilder);

  readonly constructionForm: ConstructionFinancialDriversFormGroup =
    this.formBuilder.group<ConstructionFinancialDriversFormModel>({
      closingDate: this.formBuilder.control<Date | null>(
        null,
        {
          validators: [
            max21MonthsOldValidator(
              FINANCIAL_DRIVERS_ALERT_KEYS.closingDate21Months,
            ),
          ],
        },
      ),
      debtToEquity: this.formBuilder.control<NullableNumber>(null),
      liquidityRisk: this.formBuilder.control<LiquidityRisk | null>({
        value: 'GOOD',
        disabled: true,
      }),
    });

  readonly formValue = toSignal(
    this.constructionForm.valueChanges.pipe(
      startWith(null),
      map(() => this.constructionForm.getRawValue()),
    ),
    { initialValue: this.constructionForm.getRawValue() },
  );

  readonly financialDrivers = computed<FinancialDrivers | null>(() => {
    const rating =
      this.workflowDTO().counterPartyRating as ProjectFinanceCounterpartRatingResponse;

    return rating?.financialDrivers ?? null;
  });

  readonly debtToEquityDisplay = computed(() =>
    formatComputedValue(this.constructionForm.controls.debtToEquity.value, false),
  );

  ngOnInit(): void {
    this.initFormValues();
    this.registerFormToParent();
  }

  private registerFormToParent(): void {
    this.ratingForm().setControl(FINANCIAL_DRIVERS_FORM_KEY, this.constructionForm);
  }

  private initFormValues(): void {
    const financialDrivers = this.financialDrivers();

    if (!financialDrivers) {
      return;
    }

    this.constructionForm.patchValue(
      {
        closingDate: toDate(financialDrivers.closingDate),
        debtToEquity: financialDrivers.debtToEquity,
        liquidityRisk: financialDrivers.liquidityRisk ?? 'GOOD',
      },
      { emitEvent: false },
    );
  }
}


//// amor
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { EMPTY, debounceTime, distinctUntilChanged, filter, finalize, map, skip, startWith, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { WorkflowDocument } from '...'; // adjust path
import { ProjectFinanceCounterpartRatingResponse } from '...'; // adjust path

import {
  AmortizingFinancialDriversComputePayload,
  AmortizingFinancialDriversComputeResponse,
  AmortizingFinancialDriversFormGroup,
  AmortizingFinancialDriversFormModel,
  FINANCIAL_DRIVERS_FORM_KEY,
  FinancialDrivers,
  FinancialUnit,
  LiquidityRisk,
  NullableNumber,
} from './financial-drivers.models';
import { FINANCIAL_DRIVERS_ALERT_KEYS } from './financial-drivers-alerts';
import { FinancialDriversApiService } from './financial-drivers-api.service';
import {
  formatComputedValue,
  hasValue,
  max21MonthsOldValidator,
  positiveStrictValidator,
  sameJson,
  setControlError,
  toApiDate,
  toDate,
} from './financial-drivers.utils';

@Component({
  selector: 'bnpp-financial-drivers-amortizing',
  templateUrl: './financial-drivers-amortizing.component.html',
  styleUrls: ['./financial-drivers-amortizing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversAmortizingComponent implements OnInit {
  readonly ratingForm = input.required<FormGroup>();
  readonly workflowDTO = input.required<WorkflowDocument>();
  readonly validationInProgress = input<boolean>(false);

  private readonly formBuilder = inject(FormBuilder);
  private readonly apiService = inject(FinancialDriversApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly amortizingForm: AmortizingFinancialDriversFormGroup =
    this.formBuilder.group<AmortizingFinancialDriversFormModel>(
      {
        unit: this.formBuilder.control<FinancialUnit | null>(null),
        currency: this.formBuilder.control<string | null>(null),
        closingDate: this.formBuilder.control<Date | null>(
          null,
          {
            validators: [
              max21MonthsOldValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.closingDate21Months,
              ),
            ],
          },
        ),

        seniorGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
        juniorMezzanineGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
        equity: this.formBuilder.control<NullableNumber>(null),
        quasiEquity: this.formBuilder.control<NullableNumber>(null),
        cfads: this.formBuilder.control<NullableNumber>(null),
        principalPaid: this.formBuilder.control<NullableNumber>(
          null,
          {
            validators: [
              positiveStrictValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.principalPaidPositive,
              ),
            ],
          },
        ),
        interestExpenses: this.formBuilder.control<NullableNumber>(
          null,
          {
            validators: [
              positiveStrictValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.interestExpensesPositive,
              ),
            ],
          },
        ),

        debtToEquity: this.formBuilder.control<NullableNumber>({
          value: null,
          disabled: true,
        }),
        dscr: this.formBuilder.control<NullableNumber>({
          value: null,
          disabled: true,
        }),

        adjustedDebtToEquity: this.formBuilder.control<NullableNumber>(null),
        adjustedDebtToEquityClosingDate: this.formBuilder.control<Date | null>(
          null,
          {
            validators: [
              max21MonthsOldValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquity21Months,
              ),
            ],
          },
        ),
        adjustedDebtToEquityComment: this.formBuilder.control<string | null>(null),

        adjustedDscrIcr: this.formBuilder.control<NullableNumber>(null),
        adjustedDscrIcrClosingDate: this.formBuilder.control<Date | null>(
          null,
          {
            validators: [
              max21MonthsOldValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcr21Months,
              ),
            ],
          },
        ),
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

  readonly formValue = toSignal(
    this.amortizingForm.valueChanges.pipe(
      startWith(null),
      map(() => this.amortizingForm.getRawValue()),
    ),
    { initialValue: this.amortizingForm.getRawValue() },
  );

  readonly financialDrivers = computed<FinancialDrivers | null>(() => {
    const rating =
      this.workflowDTO().counterPartyRating as ProjectFinanceCounterpartRatingResponse;

    return rating?.financialDrivers ?? null;
  });

  readonly hasAtLeastOneManualFieldFilled = computed(() => {
    const value = this.formValue();

    return [
      value.seniorGrossFinancialDebt,
      value.juniorMezzanineGrossFinancialDebt,
      value.equity,
      value.quasiEquity,
      value.cfads,
      value.principalPaid,
      value.interestExpenses,
    ].some(hasValue);
  });

  readonly hasAdjustedDebtToEquity = computed(() =>
    hasValue(this.formValue().adjustedDebtToEquity),
  );

  readonly hasAdjustedDscrIcr = computed(() =>
    hasValue(this.formValue().adjustedDscrIcr),
  );

  readonly computePayload = computed<AmortizingFinancialDriversComputePayload>(() => {
    const value = this.formValue();

    return {
      unit: value.unit,
      currency: value.currency,
      closingDate: toApiDate(value.closingDate),
      seniorGrossFinancialDebt: value.seniorGrossFinancialDebt,
      juniorMezzanineGrossFinancialDebt: value.juniorMezzanineGrossFinancialDebt,
      equity: value.equity,
      quasiEquity: value.quasiEquity,
      cfads: value.cfads,
      principalPaid: value.principalPaid,
      interestExpenses: value.interestExpenses,
    };
  });

  readonly canCompute = computed(() => {
    const payload = this.computePayload();

    return [
      payload.unit,
      payload.currency,
      payload.closingDate,
      payload.seniorGrossFinancialDebt,
      payload.juniorMezzanineGrossFinancialDebt,
      payload.equity,
      payload.quasiEquity,
      payload.cfads,
      payload.principalPaid,
      payload.interestExpenses,
    ].every(hasValue);
  });

  readonly isComputing = signal(false);
  readonly hasComputeError = signal(false);

  readonly debtToEquityDisplay = computed(() =>
    formatComputedValue(
      this.amortizingForm.controls.debtToEquity.value,
      this.hasComputeError(),
    ),
  );

  readonly dscrDisplay = computed(() =>
    formatComputedValue(
      this.amortizingForm.controls.dscr.value,
      this.hasComputeError(),
    ),
  );

  ngOnInit(): void {
    this.initFormValues();
    this.registerFormToParent();
    this.listenToComputedFieldsChanges();
  }

  private registerFormToParent(): void {
    this.ratingForm().setControl(FINANCIAL_DRIVERS_FORM_KEY, this.amortizingForm);
  }

  private initFormValues(): void {
    const financialDrivers = this.financialDrivers();

    if (!financialDrivers) {
      return;
    }

    this.amortizingForm.patchValue(
      {
        unit: financialDrivers.unit,
        currency: financialDrivers.currency,
        closingDate: toDate(financialDrivers.closingDate),

        seniorGrossFinancialDebt: financialDrivers.seniorGrossFinancialDebt,
        juniorMezzanineGrossFinancialDebt: financialDrivers.juniorMezzanineGrossFinancialDebt,
        equity: financialDrivers.equity,
        quasiEquity: financialDrivers.quasiEquity,
        cfads: financialDrivers.cfads,
        principalPaid: financialDrivers.principalPaid,
        interestExpenses: financialDrivers.interestExpenses,

        debtToEquity: financialDrivers.debtToEquity,
        dscr: financialDrivers.dscr,

        adjustedDebtToEquity: financialDrivers.adjustedDebtToEquity,
        adjustedDebtToEquityClosingDate: toDate(financialDrivers.adjustedDebtToEquityClosingDate),
        adjustedDebtToEquityComment: financialDrivers.adjustedDebtToEquityComment,

        adjustedDscrIcr: financialDrivers.adjustedDscrIcr,
        adjustedDscrIcrClosingDate: toDate(financialDrivers.adjustedDscrIcrClosingDate),
        adjustedDscrIcrComment: financialDrivers.adjustedDscrIcrComment,

        liquidityRisk: financialDrivers.liquidityRisk,
      },
      { emitEvent: false },
    );
  }

  private listenToComputedFieldsChanges(): void {
    toObservable(this.computePayload)
      .pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(sameJson),
        tap(() => {
          if (!this.canCompute()) {
            this.clearComputedFields();
            this.hasComputeError.set(false);
          }
        }),
        filter(() => this.canCompute()),
        tap(() => {
          this.isComputing.set(true);
          this.hasComputeError.set(false);
        }),
        switchMap((payload) =>
          this.apiService.computeAmortizingFinancialDrivers(payload).pipe(
            finalize(() => {
              this.isComputing.set(false);
            }),
            switchMap((response) => {
              this.patchComputedFields(response);
              return EMPTY;
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

  private patchComputedFields(
    response: AmortizingFinancialDriversComputeResponse,
  ): void {
    this.hasComputeError.set(!!response.hasCalculationError);

    this.amortizingForm.patchValue(
      {
        debtToEquity: response.hasCalculationError ? null : response.debtToEquity,
        dscr: response.hasCalculationError ? null : response.dscr,
      },
      { emitEvent: false },
    );
  }

  private clearComputedFields(): void {
    this.amortizingForm.patchValue(
      {
        debtToEquity: null,
        dscr: null,
      },
      { emitEvent: false },
    );
  }

  private manualSectionRequiredValidator(): ValidatorFn {
    return (group): ValidationErrors | null => {
      const form = group as AmortizingFinancialDriversFormGroup;
      const value = form.getRawValue();

      const hasAtLeastOneManualFieldFilled = [
        value.seniorGrossFinancialDebt,
        value.juniorMezzanineGrossFinancialDebt,
        value.equity,
        value.quasiEquity,
        value.cfads,
        value.principalPaid,
        value.interestExpenses,
      ].some(hasValue);

      setControlError(
        form.controls.unit,
        FINANCIAL_DRIVERS_ALERT_KEYS.unitRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(value.unit),
      );

      setControlError(
        form.controls.currency,
        FINANCIAL_DRIVERS_ALERT_KEYS.currencyRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(value.currency),
      );

      setControlError(
        form.controls.closingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.closingDateRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(value.closingDate),
      );

      return null;
    };
  }

  private adjustedDebtToEquityValidator(): ValidatorFn {
    return (group): ValidationErrors | null => {
      const form = group as AmortizingFinancialDriversFormGroup;
      const value = form.getRawValue();
      const shouldValidate = hasValue(value.adjustedDebtToEquity);

      setControlError(
        form.controls.adjustedDebtToEquityClosingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityClosingDateRequired,
        shouldValidate && !hasValue(value.adjustedDebtToEquityClosingDate),
      );

      setControlError(
        form.controls.adjustedDebtToEquityComment,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityCommentRequired,
        shouldValidate && !hasValue(value.adjustedDebtToEquityComment),
      );

      return null;
    };
  }

  private adjustedDscrIcrValidator(): ValidatorFn {
    return (group): ValidationErrors | null => {
      const form = group as AmortizingFinancialDriversFormGroup;
      const value = form.getRawValue();
      const shouldValidate = hasValue(value.adjustedDscrIcr);

      setControlError(
        form.controls.adjustedDscrIcrClosingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrClosingDateRequired,
        shouldValidate && !hasValue(value.adjustedDscrIcrClosingDate),
      );

      setControlError(
        form.controls.adjustedDscrIcrComment,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrCommentRequired,
        shouldValidate && !hasValue(value.adjustedDscrIcrComment),
      );

      return null;
    };
  }
}


////

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { EMPTY, debounceTime, distinctUntilChanged, filter, finalize, map, skip, startWith, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { WorkflowDocument } from '...'; // adjust path
import { ProjectFinanceCounterpartRatingResponse } from '...'; // adjust path

import {
  BulletFinancialDriversComputePayload,
  BulletFinancialDriversComputeResponse,
  BulletFinancialDriversFormGroup,
  BulletFinancialDriversFormModel,
  FINANCIAL_DRIVERS_FORM_KEY,
  FinancialDrivers,
  FinancialUnit,
  LiquidityRisk,
  NullableNumber,
} from './financial-drivers.models';
import { FINANCIAL_DRIVERS_ALERT_KEYS } from './financial-drivers-alerts';
import { FinancialDriversApiService } from './financial-drivers-api.service';
import {
  formatComputedValue,
  hasValue,
  max21MonthsOldValidator,
  positiveStrictValidator,
  sameJson,
  setControlError,
  toApiDate,
  toDate,
} from './financial-drivers.utils';

@Component({
  selector: 'bnpp-financial-drivers-bullet',
  templateUrl: './financial-drivers-bullet.component.html',
  styleUrls: ['./financial-drivers-bullet.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversBulletComponent implements OnInit {
  readonly ratingForm = input.required<FormGroup>();
  readonly workflowDTO = input.required<WorkflowDocument>();
  readonly validationInProgress = input<boolean>(false);

  private readonly formBuilder = inject(FormBuilder);
  private readonly apiService = inject(FinancialDriversApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly bulletForm: BulletFinancialDriversFormGroup =
    this.formBuilder.group<BulletFinancialDriversFormModel>(
      {
        unit: this.formBuilder.control<FinancialUnit | null>(null),
        currency: this.formBuilder.control<string | null>(null),
        closingDate: this.formBuilder.control<Date | null>(
          null,
          {
            validators: [
              max21MonthsOldValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.closingDate21Months,
              ),
            ],
          },
        ),

        seniorGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
        juniorMezzanineGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
        equity: this.formBuilder.control<NullableNumber>(null),
        quasiEquity: this.formBuilder.control<NullableNumber>(null),
        interestExpenses: this.formBuilder.control<NullableNumber>(
          null,
          {
            validators: [
              positiveStrictValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.interestExpensesPositive,
              ),
            ],
          },
        ),
        ebitda: this.formBuilder.control<NullableNumber>(null),
        maintenanceCapex: this.formBuilder.control<NullableNumber>(
          null,
          {
            validators: [
              positiveStrictValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.maintenanceCapexPositive,
              ),
            ],
          },
        ),
        taxPayments: this.formBuilder.control<NullableNumber>(null),

        debtToEquity: this.formBuilder.control<NullableNumber>({
          value: null,
          disabled: true,
        }),
        icr: this.formBuilder.control<NullableNumber>({
          value: null,
          disabled: true,
        }),

        adjustedDebtToEquity: this.formBuilder.control<NullableNumber>(null),
        adjustedDebtToEquityClosingDate: this.formBuilder.control<Date | null>(
          null,
          {
            validators: [
              max21MonthsOldValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquity21Months,
              ),
            ],
          },
        ),
        adjustedDebtToEquityComment: this.formBuilder.control<string | null>(null),

        adjustedDscrIcr: this.formBuilder.control<NullableNumber>(null),
        adjustedDscrIcrClosingDate: this.formBuilder.control<Date | null>(
          null,
          {
            validators: [
              max21MonthsOldValidator(
                FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcr21Months,
              ),
            ],
          },
        ),
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

  readonly formValue = toSignal(
    this.bulletForm.valueChanges.pipe(
      startWith(null),
      map(() => this.bulletForm.getRawValue()),
    ),
    { initialValue: this.bulletForm.getRawValue() },
  );

  readonly financialDrivers = computed<FinancialDrivers | null>(() => {
    const rating =
      this.workflowDTO().counterPartyRating as ProjectFinanceCounterpartRatingResponse;

    return rating?.financialDrivers ?? null;
  });

  readonly hasAtLeastOneManualFieldFilled = computed(() => {
    const value = this.formValue();

    return [
      value.seniorGrossFinancialDebt,
      value.juniorMezzanineGrossFinancialDebt,
      value.equity,
      value.quasiEquity,
      value.interestExpenses,
      value.ebitda,
      value.maintenanceCapex,
      value.taxPayments,
    ].some(hasValue);
  });

  readonly hasAdjustedDebtToEquity = computed(() =>
    hasValue(this.formValue().adjustedDebtToEquity),
  );

  readonly hasAdjustedDscrIcr = computed(() =>
    hasValue(this.formValue().adjustedDscrIcr),
  );

  readonly computePayload = computed<BulletFinancialDriversComputePayload>(() => {
    const value = this.formValue();

    return {
      unit: value.unit,
      currency: value.currency,
      closingDate: toApiDate(value.closingDate),
      seniorGrossFinancialDebt: value.seniorGrossFinancialDebt,
      juniorMezzanineGrossFinancialDebt: value.juniorMezzanineGrossFinancialDebt,
      equity: value.equity,
      quasiEquity: value.quasiEquity,
      interestExpenses: value.interestExpenses,
      ebitda: value.ebitda,
      maintenanceCapex: value.maintenanceCapex,
      taxPayments: value.taxPayments,
    };
  });

  readonly canCompute = computed(() => {
    const payload = this.computePayload();

    return [
      payload.unit,
      payload.currency,
      payload.closingDate,
      payload.seniorGrossFinancialDebt,
      payload.juniorMezzanineGrossFinancialDebt,
      payload.equity,
      payload.quasiEquity,
      payload.interestExpenses,
      payload.ebitda,
      payload.maintenanceCapex,
      payload.taxPayments,
    ].every(hasValue);
  });

  readonly isComputing = signal(false);
  readonly hasComputeError = signal(false);

  readonly debtToEquityDisplay = computed(() =>
    formatComputedValue(
      this.bulletForm.controls.debtToEquity.value,
      this.hasComputeError(),
    ),
  );

  readonly icrDisplay = computed(() =>
    formatComputedValue(
      this.bulletForm.controls.icr.value,
      this.hasComputeError(),
    ),
  );

  ngOnInit(): void {
    this.initFormValues();
    this.registerFormToParent();
    this.listenToComputedFieldsChanges();
  }

  private registerFormToParent(): void {
    this.ratingForm().setControl(FINANCIAL_DRIVERS_FORM_KEY, this.bulletForm);
  }

  private initFormValues(): void {
    const financialDrivers = this.financialDrivers();

    if (!financialDrivers) {
      return;
    }

    this.bulletForm.patchValue(
      {
        unit: financialDrivers.unit,
        currency: financialDrivers.currency,
        closingDate: toDate(financialDrivers.closingDate),

        seniorGrossFinancialDebt: financialDrivers.seniorGrossFinancialDebt,
        juniorMezzanineGrossFinancialDebt: financialDrivers.juniorMezzanineGrossFinancialDebt,
        equity: financialDrivers.equity,
        quasiEquity: financialDrivers.quasiEquity,
        interestExpenses: financialDrivers.interestExpenses,
        ebitda: financialDrivers.ebitda,
        maintenanceCapex: financialDrivers.maintenanceCapex,
        taxPayments: financialDrivers.taxPayments,

        debtToEquity: financialDrivers.debtToEquity,
        icr: financialDrivers.icr,

        adjustedDebtToEquity: financialDrivers.adjustedDebtToEquity,
        adjustedDebtToEquityClosingDate: toDate(financialDrivers.adjustedDebtToEquityClosingDate),
        adjustedDebtToEquityComment: financialDrivers.adjustedDebtToEquityComment,

        adjustedDscrIcr: financialDrivers.adjustedDscrIcr,
        adjustedDscrIcrClosingDate: toDate(financialDrivers.adjustedDscrIcrClosingDate),
        adjustedDscrIcrComment: financialDrivers.adjustedDscrIcrComment,

        liquidityRisk: financialDrivers.liquidityRisk,
      },
      { emitEvent: false },
    );
  }

  private listenToComputedFieldsChanges(): void {
    toObservable(this.computePayload)
      .pipe(
        skip(1),
        debounceTime(300),
        distinctUntilChanged(sameJson),
        tap(() => {
          if (!this.canCompute()) {
            this.clearComputedFields();
            this.hasComputeError.set(false);
          }
        }),
        filter(() => this.canCompute()),
        tap(() => {
          this.isComputing.set(true);
          this.hasComputeError.set(false);
        }),
        switchMap((payload) =>
          this.apiService.computeBulletFinancialDrivers(payload).pipe(
            finalize(() => {
              this.isComputing.set(false);
            }),
            switchMap((response) => {
              this.patchComputedFields(response);
              return EMPTY;
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

  private patchComputedFields(
    response: BulletFinancialDriversComputeResponse,
  ): void {
    this.hasComputeError.set(!!response.hasCalculationError);

    this.bulletForm.patchValue(
      {
        debtToEquity: response.hasCalculationError ? null : response.debtToEquity,
        icr: response.hasCalculationError ? null : response.icr,
      },
      { emitEvent: false },
    );
  }

  private clearComputedFields(): void {
    this.bulletForm.patchValue(
      {
        debtToEquity: null,
        icr: null,
      },
      { emitEvent: false },
    );
  }

  private manualSectionRequiredValidator(): ValidatorFn {
    return (group): ValidationErrors | null => {
      const form = group as BulletFinancialDriversFormGroup;
      const value = form.getRawValue();

      const hasAtLeastOneManualFieldFilled = [
        value.seniorGrossFinancialDebt,
        value.juniorMezzanineGrossFinancialDebt,
        value.equity,
        value.quasiEquity,
        value.interestExpenses,
        value.ebitda,
        value.maintenanceCapex,
        value.taxPayments,
      ].some(hasValue);

      setControlError(
        form.controls.unit,
        FINANCIAL_DRIVERS_ALERT_KEYS.unitRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(value.unit),
      );

      setControlError(
        form.controls.currency,
        FINANCIAL_DRIVERS_ALERT_KEYS.currencyRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(value.currency),
      );

      setControlError(
        form.controls.closingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.closingDateRequired,
        hasAtLeastOneManualFieldFilled && !hasValue(value.closingDate),
      );

      return null;
    };
  }

  private adjustedDebtToEquityValidator(): ValidatorFn {
    return (group): ValidationErrors | null => {
      const form = group as BulletFinancialDriversFormGroup;
      const value = form.getRawValue();
      const shouldValidate = hasValue(value.adjustedDebtToEquity);

      setControlError(
        form.controls.adjustedDebtToEquityClosingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityClosingDateRequired,
        shouldValidate && !hasValue(value.adjustedDebtToEquityClosingDate),
      );

      setControlError(
        form.controls.adjustedDebtToEquityComment,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityCommentRequired,
        shouldValidate && !hasValue(value.adjustedDebtToEquityComment),
      );

      return null;
    };
  }

  private adjustedDscrIcrValidator(): ValidatorFn {
    return (group): ValidationErrors | null => {
      const form = group as BulletFinancialDriversFormGroup;
      const value = form.getRawValue();
      const shouldValidate = hasValue(value.adjustedDscrIcr);

      setControlError(
        form.controls.adjustedDscrIcrClosingDate,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrClosingDateRequired,
        shouldValidate && !hasValue(value.adjustedDscrIcrClosingDate),
      );

      setControlError(
        form.controls.adjustedDscrIcrComment,
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrCommentRequired,
        shouldValidate && !hasValue(value.adjustedDscrIcrComment),
      );

      return null;
    };
  }
}


/// add to const comp
readonly liquidityRiskLabel = computed(() => {
  const value = this.constructionForm.controls.liquidityRisk.value;

  switch (value) {
    case 'EXCELLENT':
      return 'Excellent (> 12 months of debt service)';
    case 'GOOD':
      return 'Good (6-12 months of debt service)';
    case 'LIMITED':
      return 'Limited (< 6 months of debt service)';
    default:
      return '-';
  }
});


/// add to amor

type AmortizingManualFieldKey =
  | 'juniorMezzanineGrossFinancialDebt'
  | 'equity'
  | 'quasiEquity'
  | 'cfads'
  | 'principalPaid'
  | 'interestExpenses';

interface WorkflowSelectItem {
  label: string;
  value: string;
}

interface AmortizingManualFieldVm {
  key: AmortizingManualFieldKey;
  label: string;
  placeholder: string;
  positiveErrorKey?: string;
  showInfoIcon?: boolean;
}

const DEFAULT_CURRENCIES: WorkflowSelectItem[] = [
  { label: 'EUR', value: 'EUR' },
  { label: 'USD', value: 'USD' },
  { label: 'GBP', value: 'GBP' },
  { label: 'CHF', value: 'CHF' },
];


/////

readonly referenceCurrencyUnitList: WorkflowSelectItem[] = [
  { label: 'Unit', value: 'UNIT' },
  { label: 'Thousand', value: 'THOUSAND' },
  { label: 'Million', value: 'MILLION' },
  { label: 'Billion', value: 'BILLION' },
  { label: 'Trillion', value: 'TRILLION' },
];

readonly currencyComboValues = signal<WorkflowSelectItem[]>(DEFAULT_CURRENCIES);

readonly manualFields = computed<AmortizingManualFieldVm[]>(() => [
  {
    key: 'juniorMezzanineGrossFinancialDebt',
    label: 'Dette Financière Brute Junior/Mezzanine',
    placeholder: 'financialDriversJuniorMezzanineGrossFinancialDebtPlaceholder',
  },
  {
    key: 'equity',
    label: 'Fonds Propres',
    placeholder: 'financialDriversEquityPlaceholder',
  },
  {
    key: 'quasiEquity',
    label: 'Quasi-fonds Propres',
    placeholder: 'financialDriversQuasiEquityPlaceholder',
  },
  {
    key: 'cfads',
    label: 'CFADS',
    placeholder: 'financialDriversCfadsPlaceholder',
  },
  {
    key: 'principalPaid',
    label: 'Principal Paid',
    placeholder: 'financialDriversPrincipalPaidPlaceholder',
    positiveErrorKey: 'financialDriversPrincipalPaidPositive',
  },
  {
    key: 'interestExpenses',
    label: 'Interest Expenses',
    placeholder: 'financialDriversInterestExpensesPlaceholder',
    positiveErrorKey: 'financialDriversInterestExpensesPositive',
  },
]);

readonly selectedUnitLabel = computed(() => {
  const selectedValue = this.formValue().unit;

  return (
    this.referenceCurrencyUnitList.find((item) => item.value === selectedValue)?.label ?? '-'
  );
});

readonly selectedCurrencyLabel = computed(() => {
  const selectedValue = this.formValue().currency;
  return selectedValue || '-';
});

readonly liquidityRiskLabel = computed(() => {
  const value = this.amortizingForm.controls.liquidityRisk.value;

  switch (value) {
    case 'EXCELLENT':
      return 'Excellent (> 12 months of debt service)';
    case 'GOOD':
      return 'Good (6-12 months of debt service)';
    case 'LIMITED':
      return 'Limited (< 6 months of debt service)';
    default:
      return '-';
  }
});

getControl(key: AmortizingManualFieldKey) {
  return this.amortizingForm.controls[key];
}

onSearchCurrencies(searchValue: string): void {
  const normalizedValue = (searchValue ?? '').trim().toUpperCase();

  if (!normalizedValue) {
    this.currencyComboValues.set(DEFAULT_CURRENCIES);
    return;
  }

  this.currencyComboValues.set(
    DEFAULT_CURRENCIES.filter((currency) =>
      currency.label.toUpperCase().includes(normalizedValue) ||
      currency.value.toUpperCase().includes(normalizedValue),
    ),
  );
}


///// html

<div class="crf-mat-expansion-content">
  <mat-card class="crf-mat-expansion-content-card">
    <mat-card-content>
      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversClosingDateLabel">Date de clôture</div> -->
        <div class="row-label">Date de clôture</div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="closingDatePicker"
              [formControl]="constructionForm.controls.closingDate"
              placeholder="Date de clôture"
            />
            <mat-datepicker-toggle matIconSuffix [for]="closingDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #closingDatePicker></mat-datepicker>
          </mat-form-field>

          @if (
            (constructionForm.controls.closingDate.touched || validationInProgress()) &&
            constructionForm.controls.closingDate.errors &&
            constructionForm.controls.closingDate.errors['financialDriversClosingDate21Months']
          ) {
            <!-- <div class="field-error" i18n="@@fieldIncorrectLabel">Veuillez modifier votre saisie</div> -->
            <div class="field-error">Veuillez modifier votre saisie</div>
          }
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversDebtToEquityConstructionLabel">Dette sur Capitaux Propres %</div> -->
        <div class="row-label">
          Dette sur Capitaux Propres %
          <mat-icon class="info-icon">info</mat-icon>
        </div>

        <div class="row-content row-content-full">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(constructionForm.get('debtToEquity'))"
            [formFieldLabel]="'financialDriversDebtToEquityConstructionLabel'"
            [placeholderKey]="'financialDriversDebtToEquityConstructionPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversDataLabel">Data</div> -->
        <div class="row-label">Data</div>

        <div class="row-content row-content-full">
          <div class="data-container">
            <!-- <span class="data-text" i18n="@@financialDriversLiquidityRiskLabel">Risque de liquidité (LR)</span> -->
            <span class="data-text">Risque de liquidité (LR)</span>
            <span class="text-capitalize data-indicator">
              {{ liquidityRiskLabel() }}
            </span>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>


              ///// html amor


              <div class="crf-mat-expansion-content">
  <mat-card class="crf-mat-expansion-content-card">
    <mat-card-content>
      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversClosingDateLabel">Date de clôture</div> -->
        <div class="row-label">Date de clôture</div>

        <div class="row-content">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="closingDatePicker"
              [formControl]="amortizingForm.controls.closingDate"
              placeholder="Date de clôture"
              aria-required="true"
            />
            <mat-datepicker-toggle matIconSuffix [for]="closingDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #closingDatePicker></mat-datepicker>
          </mat-form-field>

          @if (
            (amortizingForm.controls.closingDate.touched || validationInProgress()) &&
            amortizingForm.controls.closingDate.errors &&
            amortizingForm.controls.closingDate.errors['financialDriversClosingDateRequired']
          ) {
            <!-- <div class="field-error" i18n="@@fieldMissingErrorLabel">Ce champ est manquant</div> -->
            <div class="field-error">Ce champ est manquant</div>
          }

          @if (
            (amortizingForm.controls.closingDate.touched || validationInProgress()) &&
            amortizingForm.controls.closingDate.errors &&
            amortizingForm.controls.closingDate.errors['financialDriversClosingDate21Months']
          ) {
            <!-- <div class="field-error" i18n="@@fieldIncorrectLabel">Veuillez modifier votre saisie</div> -->
            <div class="field-error">Veuillez modifier votre saisie</div>
          }
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversSeniorGrossFinancialDebtLabel">Dette Financière Brute Senior</div> -->
        <div class="row-label">Dette Financière Brute Senior</div>

        <div class="row-content">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(amortizingForm.get('seniorGrossFinancialDebt'))"
            [formFieldLabel]="'financialDriversSeniorGrossFinancialDebtLabel'"
            [placeholderKey]="'financialDriversSeniorGrossFinancialDebtPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>

        <div class="row-content">
          <div class="reference-currency-column">
            <div class="reference-currency-row">
              <div class="reference-currency-item">
                <bnpp-workflow-select-list
                  [placeholder]="'financialDriversUnitPlaceholder'"
                  [itemsList]="referenceCurrencyUnitList"
                  [colorTheme]="'RATING_THEME'"
                  [selectControl]="$any(amortizingForm.get('unit'))"
                ></bnpp-workflow-select-list>
              </div>
            </div>

            @if (
              (amortizingForm.controls.unit.touched || validationInProgress()) &&
              amortizingForm.controls.unit.errors &&
              amortizingForm.controls.unit.errors['financialDriversUnitRequired']
            ) {
              <!-- <div class="field-error" i18n="@@fieldMissingErrorLabel">Ce champ est manquant</div> -->
              <div class="field-error">Ce champ est manquant</div>
            }
          </div>
        </div>

        <div class="row-content">
          <bnpp-workflow-autocomplete
            class="w-100"
            [placeholder]="'financialDriversCurrencyPlaceholder'"
            [itemsList]="currencyComboValues()"
            [autocompleteControl]="$any(amortizingForm.get('currency'))"
            [inputChangedValueEvent]="onSearchCurrencies($event)"
            [colorTheme]="'RATING_THEME'"
          ></bnpp-workflow-autocomplete>

          @if (
            (amortizingForm.controls.currency.touched || validationInProgress()) &&
            amortizingForm.controls.currency.errors &&
            amortizingForm.controls.currency.errors['financialDriversCurrencyRequired']
          ) {
            <!-- <div class="field-error" i18n="@@fieldMissingErrorLabel">Ce champ est manquant</div> -->
            <div class="field-error">Ce champ est manquant</div>
          }
        </div>
      </div>

      @for (field of manualFields(); track field.key) {
        <div class="row-item fade-in">
          <div class="row-label">
            <span>{{ field.label }}</span>

            @if (field.showInfoIcon) {
              <mat-icon class="info-icon">info</mat-icon>
            }
          </div>

          <div class="row-content">
            <bnpp-workflow-input
              class="w-100"
              [formControl]="$any(getControl(field.key))"
              [formFieldLabel]="field.placeholder"
              [placeholderKey]="field.placeholder"
              [inputType]="'number'"
            ></bnpp-workflow-input>

            @if (
              field.positiveErrorKey &&
              (getControl(field.key).touched || validationInProgress()) &&
              getControl(field.key).errors &&
              getControl(field.key).errors![field.positiveErrorKey]
            ) {
              <!-- <div class="field-error" i18n="@@financialDriversPositiveValueInlineLabel">Ce champ doit être une valeur positive</div> -->
              <div class="field-error">Ce champ doit être une valeur positive</div>
            }
          </div>

          <div class="row-content">
            <div class="data-container readonly-meta-container">
              <!-- <span class="data-text" i18n="@@financialDriversInheritedUnitLabel">Unité héritée</span> -->
              <span class="data-text">Unité héritée</span>
              <span class="text-capitalize data-indicator">
                {{ selectedUnitLabel() }}
              </span>
            </div>
          </div>

          <div class="row-content">
            <div class="data-container readonly-meta-container">
              <!-- <span class="data-text" i18n="@@financialDriversInheritedCurrencyLabel">Devise héritée</span> -->
              <span class="data-text">Devise héritée</span>
              <span class="text-capitalize data-indicator">
                {{ selectedCurrencyLabel() }}
              </span>
            </div>
          </div>
        </div>
      }

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversDataLabel">Data</div> -->
        <div class="row-label">Data</div>

        <div class="row-content">
          <div class="data-container">
            <!-- <span class="data-text" i18n="@@financialDriversDebtToEquityLabel">Dette sur Capitaux Propres</span> -->
            <span class="data-text">Dette sur Capitaux Propres</span>
            <span class="text-capitalize data-indicator">
              {{ debtToEquityDisplay() }}
            </span>
          </div>
        </div>

        <div class="row-content">
          <div class="data-container">
            <!-- <span class="data-text" i18n="@@financialDriversDscrLabel">DSCR</span> -->
            <span class="data-text">DSCR</span>
            <span class="text-capitalize data-indicator">
              {{ dscrDisplay() }}
            </span>
          </div>
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityLabel">Dette sur Capitaux Propres ajustée (si nécessaire)</div> -->
        <div class="row-label">Dette sur Capitaux Propres ajustée (si nécessaire)</div>

        <div class="row-content">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(amortizingForm.get('adjustedDebtToEquity'))"
            [formFieldLabel]="'financialDriversAdjustedDebtToEquityLabel'"
            [placeholderKey]="'financialDriversAdjustedDebtToEquityPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text">Unité héritée</span>
            <span class="text-capitalize data-indicator">
              {{ selectedUnitLabel() }}
            </span>
          </div>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text">Devise héritée</span>
            <span class="text-capitalize data-indicator">
              {{ selectedCurrencyLabel() }}
            </span>
          </div>
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityClosingDateLabel">Date de clôture du Debt to Equity ajusté</div> -->
        <div class="row-label">Date de clôture du Debt to Equity ajusté</div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="adjustedDebtToEquityDatePicker"
              [formControl]="amortizingForm.controls.adjustedDebtToEquityClosingDate"
              [placeholder]="'financialDriversAdjustedDebtToEquityClosingDatePlaceholder'"
            />
            <mat-datepicker-toggle matIconSuffix [for]="adjustedDebtToEquityDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #adjustedDebtToEquityDatePicker></mat-datepicker>
          </mat-form-field>

          @if (
            (amortizingForm.controls.adjustedDebtToEquityClosingDate.touched || validationInProgress()) &&
            amortizingForm.controls.adjustedDebtToEquityClosingDate.errors &&
            amortizingForm.controls.adjustedDebtToEquityClosingDate.errors['financialDriversAdjustedDebtToEquityClosingDateRequired']
          ) {
            <!-- <div class="field-error" i18n="@@fieldMissingErrorLabel">Ce champ est manquant</div> -->
            <div class="field-error">Ce champ est manquant</div>
          }

          @if (
            (amortizingForm.controls.adjustedDebtToEquityClosingDate.touched || validationInProgress()) &&
            amortizingForm.controls.adjustedDebtToEquityClosingDate.errors &&
            amortizingForm.controls.adjustedDebtToEquityClosingDate.errors['financialDriversAdjustedDebtToEquity21Months']
          ) {
            <!-- <div class="field-error" i18n="@@fieldIncorrectLabel">Veuillez modifier votre saisie</div> -->
            <div class="field-error">Veuillez modifier votre saisie</div>
          }
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityCommentLabel">Commentaire en cas de Debt to Equity ajusté</div> -->
        <div class="row-label">Commentaire en cas de Debt to Equity ajusté</div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100">
            <textarea
              matInput
              rows="3"
              [formControl]="amortizingForm.controls.adjustedDebtToEquityComment"
              [placeholder]="'financialDriversAdjustedDebtToEquityCommentPlaceholder'"
            ></textarea>
          </mat-form-field>

          @if (
            (amortizingForm.controls.adjustedDebtToEquityComment.touched || validationInProgress()) &&
            amortizingForm.controls.adjustedDebtToEquityComment.errors &&
            amortizingForm.controls.adjustedDebtToEquityComment.errors['financialDriversAdjustedDebtToEquityCommentRequired']
          ) {
            <!-- <div class="field-error" i18n="@@fieldMissingErrorLabel">Ce champ est manquant</div> -->
            <div class="field-error">Ce champ est manquant</div>
          }
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversAdjustedDscrIcrLabel">DSCR/ICR ajusté (si nécessaire)</div> -->
        <div class="row-label">DSCR/ICR ajusté (si nécessaire)</div>

        <div class="row-content">
          <bnpp-workflow-input
            class="w-100"
            [formControl]="$any(amortizingForm.get('adjustedDscrIcr'))"
            [formFieldLabel]="'financialDriversAdjustedDscrIcrLabel'"
            [placeholderKey]="'financialDriversAdjustedDscrIcrPlaceholder'"
            [inputType]="'number'"
          ></bnpp-workflow-input>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text">Unité héritée</span>
            <span class="text-capitalize data-indicator">
              {{ selectedUnitLabel() }}
            </span>
          </div>
        </div>

        <div class="row-content">
          <div class="data-container readonly-meta-container">
            <span class="data-text">Devise héritée</span>
            <span class="text-capitalize data-indicator">
              {{ selectedCurrencyLabel() }}
            </span>
          </div>
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversAdjustedDscrIcrClosingDateLabel">Date d’arrêté de DSCR/ICR override</div> -->
        <div class="row-label">Date d’arrêté de DSCR/ICR override</div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="adjustedDscrIcrDatePicker"
              [formControl]="amortizingForm.controls.adjustedDscrIcrClosingDate"
              [placeholder]="'financialDriversAdjustedDscrIcrClosingDatePlaceholder'"
            />
            <mat-datepicker-toggle matIconSuffix [for]="adjustedDscrIcrDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #adjustedDscrIcrDatePicker></mat-datepicker>
          </mat-form-field>

          @if (
            (amortizingForm.controls.adjustedDscrIcrClosingDate.touched || validationInProgress()) &&
            amortizingForm.controls.adjustedDscrIcrClosingDate.errors &&
            amortizingForm.controls.adjustedDscrIcrClosingDate.errors['financialDriversAdjustedDscrIcrClosingDateRequired']
          ) {
            <div class="field-error">Ce champ est manquant</div>
          }

          @if (
            (amortizingForm.controls.adjustedDscrIcrClosingDate.touched || validationInProgress()) &&
            amortizingForm.controls.adjustedDscrIcrClosingDate.errors &&
            amortizingForm.controls.adjustedDscrIcrClosingDate.errors['financialDriversAdjustedDscrIcr21Months']
          ) {
            <div class="field-error">Veuillez modifier votre saisie</div>
          }
        </div>
      </div>

      <div class="row-item fade-in">
        <!-- <div class="row-label" i18n="@@financialDriversAdjustedDscrIcrCommentLabel">Commentaire en cas de DSCR/ICR ajusté</div> -->
        <div class="row-label">Commentaire en cas de DSCR/ICR ajusté</div>

        <div class="row-content row-content-full">
          <mat-form-field appearance="outline" class="w-100">
            <textarea
              matInput
              rows="3"
              [formControl]="amortizingForm.controls.adjustedDscrIcrComment"
              [placeholder]="'financialDriversAdjustedDscrIcrCommentPlaceholder'"
            ></textarea>
          </mat-form-field>

          @if (
            (amortizingForm.controls.adjustedDscrIcrComment.touched || validationInProgress()) &&
            amortizingForm.controls.adjustedDscrIcrComment.errors &&
            amortizingForm.controls.adjustedDscrIcrComment.errors['financialDriversAdjustedDscrIcrCommentRequired']
          ) {
            <div class="field-error">Ce champ est manquant</div>
          }
        </div>
      </div>

      <div class="row-item fade-in">
        <div class="row-label">Data</div>

        <div class="row-content row-content-full">
          <div class="data-container">
            <span class="data-text">Risque de liquidité (LR)</span>
            <span class="text-capitalize data-indicator">
              {{ liquidityRiskLabel() }}
            </span>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>
</div>



