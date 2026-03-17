import {ChangeDetectionStrategy, Component, signal} from '@angular/core';
import {form, FormField} from '@angular/forms/signals';
interface LoginData {
  email: string;
  password: string;
}
@Component({
  selector: 'app-root',
  templateUrl: 'app.html',
  styleUrl: 'app.css',
  imports: [FormField],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  loginModel = signal<LoginData>({
    email: '',
    password: '',
  });
  loginForm = form(this.loginModel);
}








<!-- Date and time - stores as ISO format strings -->
<input type="date" [formField]="form.eventDate" />
<input type="time" [formField]="form.eventTime" />















  <!-- Single checkbox -->
<label>
  <input type="checkbox" [formField]="form.agreeToTerms" />
  I agree to the terms
</label>











import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@shared/modules/MaterialModule';

// À adapter à ton repo
import { WorkflowDocument } from '@core/models/workflow-document.model';
import { FinancialDriversConstructionComponent } from './financial-drivers-construction.component';
import { FinancialDriversAmortizingComponent } from './financial-drivers-amortizing.component';

type ProjectPhase = 'CONSTRUCTION' | 'EARLY_OPERATION' | 'OPERATION' | null;
type TransactionType = 'AMORTIZING' | 'BULLET' | null;

@Component({
  selector: 'bnpp-financial-drivers',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    FinancialDriversConstructionComponent,
    FinancialDriversAmortizingComponent,
  ],
  templateUrl: './financial-drivers.component.html',
  styleUrls: ['./financial-drivers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversComponent {
  ratingForm = input.required<FormGroup>();
  workflowDTO = input.required<WorkflowDocument>();
  validationInProgress = input<boolean>(false);

  readonly projectPhase = computed<ProjectPhase>(() => {
    return this.ratingForm().get('projectPhase.projectPhase')?.value ?? null;
  });

  readonly transactionType = computed<TransactionType>(() => {
    return this.ratingForm().get('projectPhase.transactionType')?.value ?? null;
  });

  readonly showConstruction = computed(() => {
    return this.projectPhase() === 'CONSTRUCTION';
  });

  readonly showAmortizing = computed(() => {
    const phase = this.projectPhase();
    const transactionType = this.transactionType();

    return (
      (phase === 'EARLY_OPERATION' || phase === 'OPERATION') &&
      transactionType === 'AMORTIZING'
    );
  });
}



import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@shared/modules/MaterialModule';

// À adapter à ton repo
import { WorkflowDocument } from '@core/models/workflow-document.model';
import { FinancialDriversConstructionComponent } from './financial-drivers-construction.component';
import { FinancialDriversAmortizingComponent } from './financial-drivers-amortizing.component';

type ProjectPhase = 'CONSTRUCTION' | 'EARLY_OPERATION' | 'OPERATION' | null;
type TransactionType = 'AMORTIZING' | 'BULLET' | null;

@Component({
  selector: 'bnpp-financial-drivers',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    FinancialDriversConstructionComponent,
    FinancialDriversAmortizingComponent,
  ],
  templateUrl: './financial-drivers.component.html',
  styleUrls: ['./financial-drivers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversComponent {
  ratingForm = input.required<FormGroup>();
  workflowDTO = input.required<WorkflowDocument>();
  validationInProgress = input<boolean>(false);

  readonly projectPhase = computed<ProjectPhase>(() => {
    return this.ratingForm().get('projectPhase.projectPhase')?.value ?? null;
  });

  readonly transactionType = computed<TransactionType>(() => {
    return this.ratingForm().get('projectPhase.transactionType')?.value ?? null;
  });

  readonly showConstruction = computed(() => {
    return this.projectPhase() === 'CONSTRUCTION';
  });

  readonly showAmortizing = computed(() => {
    const phase = this.projectPhase();
    const transactionType = this.transactionType();

    return (
      (phase === 'EARLY_OPERATION' || phase === 'OPERATION') &&
      transactionType === 'AMORTIZING'
    );
  });
}


/////

@if (showConstruction()) {
  <bnpp-financial-drivers-construction
    [ratingForm]="ratingForm()"
    [workflowDTO]="workflowDTO()"
    [validationInProgress]="validationInProgress()"
  />
}

@if (showAmortizing()) {
  <bnpp-financial-drivers-amortizing
    [ratingForm]="ratingForm()"
    [workflowDTO]="workflowDTO()"
    [validationInProgress]="validationInProgress()"
  />
}


////

export const FINANCIAL_DRIVERS_ALERT_KEYS = {
  unitRequired: 'financialDriversUnitRequired',
  currencyRequired: 'financialDriversCurrencyRequired',
  closingDateRequired: 'financialDriversClosingDateRequired',
  closingDate21Months: 'financialDriversClosingDate21Months',

  principalPaidPositive: 'financialDriversPrincipalPaidPositive',
  interestExpensesPositive: 'financialDriversInterestExpensesPositive',

  adjustedDebtToEquityClosingDateRequired:
    'financialDriversAdjustedDebtToEquityClosingDateRequired',
  adjustedDebtToEquityCommentRequired:
    'financialDriversAdjustedDebtToEquityCommentRequired',
  adjustedDebtToEquity21Months: 'financialDriversAdjustedDebtToEquity21Months',

  adjustedDscrIcrClosingDateRequired:
    'financialDriversAdjustedDscrIcrClosingDateRequired',
  adjustedDscrIcrCommentRequired:
    'financialDriversAdjustedDscrIcrCommentRequired',
  adjustedDscrIcr21Months: 'financialDriversAdjustedDscrIcr21Months',
} as const;



////


import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { MaterialModule } from '@shared/modules/MaterialModule';
import { WorkflowDocument } from '@core/models/workflow-document.model';
import { FINANCIAL_DRIVERS_ALERT_KEYS } from './financial-drivers-alerts.constants';

type NullableNumber = number | null;
type LiquidityRisk = 'EXCELLENT' | 'GOOD' | 'LIMITED';

@Component({
  selector: 'bnpp-financial-drivers-construction',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './financial-drivers-construction.component.html',
  styleUrls: ['./financial-drivers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversConstructionComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  ratingForm = input.required<FormGroup>();
  workflowDTO = input.required<WorkflowDocument>();
  validationInProgress = input<boolean>(false);

  readonly constructionForm = this.formBuilder.group(
    {
      closingDate: this.formBuilder.control<Date | null>(null),
      seniorGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
      juniorMezzanineGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
      equity: this.formBuilder.control<NullableNumber>(null),
      quasiEquity: this.formBuilder.control<NullableNumber>(null),
      liquidityRisk: this.formBuilder.control<LiquidityRisk | null>('GOOD'),
    },
    {
      validators: [this.closingDate21MonthsValidator()],
    }
  );

  private readonly formValue = toSignal(
    this.constructionForm.valueChanges.pipe(startWith(this.constructionForm.getRawValue())),
    { initialValue: this.constructionForm.getRawValue() }
  );

  readonly debtToEquityDisplay = computed(() => {
    const value = this.formValue();

    const seniorDebt = this.toNumber(value.seniorGrossFinancialDebt);
    const juniorDebt = this.toNumber(value.juniorMezzanineGrossFinancialDebt);
    const equity = this.toNumber(value.equity);
    const quasiEquity = this.toNumber(value.quasiEquity);

    const denominator = equity + quasiEquity;
    if (denominator === 0) {
      return '/';
    }

    return this.formatRatio((seniorDebt + juniorDebt) / denominator);
  });

  readonly liquidityRiskLabel = computed(() => {
    const value = this.constructionForm.controls.liquidityRisk.value;

    switch (value) {
      case 'EXCELLENT':
        return $localize`:@@financialDriversLiquidityRiskExcellentLabel:Excellent (> 12 mois de service de la dette)`;
      case 'LIMITED':
        return $localize`:@@financialDriversLiquidityRiskLimitedLabel:Limited (< 6 mois de service de la dette)`;
      case 'GOOD':
      default:
        return $localize`:@@financialDriversLiquidityRiskGoodLabel:Good (6 - 12 mois de service de la dette)`;
    }
  });

  constructor() {
    this.registerFormInParent();
    this.setupValidationRefresh();
  }

  onClosingDateChange(event: { value: Date | null }): void {
    this.constructionForm.controls.closingDate.setValue(event.value);
    this.constructionForm.controls.closingDate.markAsDirty();
    this.constructionForm.controls.closingDate.updateValueAndValidity();
  }

  private registerFormInParent(): void {
    this.ratingForm().setControl('financialDrivers', this.constructionForm);
  }

  private setupValidationRefresh(): void {
    this.constructionForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.constructionForm.updateValueAndValidity({ emitEvent: false });
      });
  }

  private closingDate21MonthsValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const closingDateControl = group.get('closingDate');

      if (!closingDateControl?.value) {
        return null;
      }

      const inputDate = new Date(closingDateControl.value);
      if (Number.isNaN(inputDate.getTime())) {
        return null;
      }

      const today = new Date();
      const limitDate = new Date(today);
      limitDate.setMonth(today.getMonth() - 21);

      this.setControlError(
        closingDateControl,
        FINANCIAL_DRIVERS_ALERT_KEYS.closingDate21Months,
        inputDate < limitDate
      );

      return null;
    };
  }

  private setControlError(
    control: AbstractControl | null,
    errorKey: string,
    shouldSet: boolean
  ): void {
    if (!control) {
      return;
    }

    const errors = { ...(control.errors ?? {}) };

    if (shouldSet) {
      errors[errorKey] = true;
      control.setErrors(errors);
      return;
    }

    delete errors[errorKey];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private toNumber(value: unknown): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  }

  private formatRatio(value: number): string {
    return Number.isFinite(value) ? value.toFixed(2) : '/';
  }
}



///



<mat-accordion class="accordion-container" multi hideToggle>
  <mat-expansion-panel class="crf-expansion-panel" #panel [expanded]="true">
    <mat-expansion-panel-header class="workflow-details-panel-header">
      <mat-panel-title>
        <div class="header-panel-container">
          <span class="title-text" i18n="@@financialDriversTitle">Drivers financiers</span>
          <mat-icon class="panel-expand-icon">
            {{ panel.expanded ? 'remove' : 'add' }}
          </mat-icon>
        </div>
      </mat-panel-title>
    </mat-expansion-panel-header>

    <div class="crf-mat-expansion-content">
      <mat-card class="crf-mat-expansion-content-card">
        <mat-card-content>
          <form [formGroup]="constructionForm">
            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversClosingDateLabel">
                Date de clôture
              </div>

              <div class="row-content row-content-full">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="closingDatePicker"
                    [formControl]="constructionForm.controls.closingDate"
                    (dateChange)="onClosingDateChange($event)"
                    i18n-placeholder="@@financialDriversClosingDatePlaceholder"
                    placeholder="Date de clôture"
                  />
                  <mat-datepicker-toggle
                    matIconSuffix
                    [for]="closingDatePicker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #closingDatePicker></mat-datepicker>
                </mat-form-field>

                @if (
                  (constructionForm.controls.closingDate.touched || validationInProgress()) &&
                  constructionForm.controls.closingDate.errors &&
                  constructionForm.controls.closingDate.errors['financialDriversClosingDate21Months']
                ) {
                  <div class="field-error" i18n="@@fieldIncorrectLabel">
                    Veuillez modifier votre saisie
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversDebtToEquityConstructionLabel">
                Dette sur Capitaux Propres %
              </div>

              <div class="row-content row-content-full">
                <div class="data-container large-readonly-value">
                  <span class="text-capitalize data-indicator">
                    {{ debtToEquityDisplay() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversDataLabel">
                Data
              </div>

              <div class="row-content row-content-full">
                <div class="data-container">
                  <span class="data-text" i18n="@@financialDriversLiquidityRiskLabel">
                    Risque de liquidité (LR)
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ liquidityRiskLabel() }}
                  </span>
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  </mat-expansion-panel>
</mat-accordion>



                    /////


import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { MaterialModule } from '@shared/modules/MaterialModule';
import { WorkflowDocument } from '@core/models/workflow-document.model';
import { WorkflowInputComponent } from '@shared/components/workflow-input/workflow-input.component';
import { WorkflowSelectListComponent } from '@shared/components/workflow-select-list/workflow-select-list.component';
import { WorkflowAutocompleteComponent } from '@shared/components/workflow-autocomplete/workflow-autocomplete.component';
import { FINANCIAL_DRIVERS_ALERT_KEYS } from './financial-drivers-alerts.constants';

type NullableNumber = number | null;
type NullableString = string | null;
type FinancialDriverUnit = 'thousand' | 'million' | 'billion' | 'trillion';
type LiquidityRisk = 'EXCELLENT' | 'GOOD' | 'LIMITED';

type ManualFieldKey =
  | 'seniorGrossFinancialDebt'
  | 'juniorMezzanineGrossFinancialDebt'
  | 'equity'
  | 'quasiEquity'
  | 'cfads'
  | 'principalPaid'
  | 'interestExpenses';

interface IItemList {
  label: string;
  value: string;
}

interface ComboboxField {
  label: string;
  value: string;
}

interface ManualFieldConfig {
  key: ManualFieldKey;
  label: string;
  placeholder: string;
  positiveOnly?: boolean;
  showInfoIcon?: boolean;
}

@Component({
  selector: 'bnpp-financial-drivers-amortizing',
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    WorkflowInputComponent,
    WorkflowSelectListComponent,
    WorkflowAutocompleteComponent,
  ],
  templateUrl: './financial-drivers-amortizing.component.html',
  styleUrls: ['./financial-drivers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialDriversAmortizingComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  ratingForm = input.required<FormGroup>();
  workflowDTO = input.required<WorkflowDocument>();
  validationInProgress = input<boolean>(false);

  readonly amortizingForm = this.formBuilder.group(
    {
      unit: this.formBuilder.control<FinancialDriverUnit | null>(null),
      currency: this.formBuilder.control<string | null>(null),
      closingDate: this.formBuilder.control<Date | null>(null),

      seniorGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
      juniorMezzanineGrossFinancialDebt: this.formBuilder.control<NullableNumber>(null),
      equity: this.formBuilder.control<NullableNumber>(null),
      quasiEquity: this.formBuilder.control<NullableNumber>(null),
      cfads: this.formBuilder.control<NullableNumber>(null),
      principalPaid: this.formBuilder.control<NullableNumber>(null),
      interestExpenses: this.formBuilder.control<NullableNumber>(null),

      adjustedDebtToEquity: this.formBuilder.control<NullableNumber>(null),
      adjustedDebtToEquityClosingDate: this.formBuilder.control<Date | null>(null),
      adjustedDebtToEquityComment: this.formBuilder.control<NullableString>(null),

      adjustedDscrIcr: this.formBuilder.control<NullableNumber>(null),
      adjustedDscrIcrClosingDate: this.formBuilder.control<Date | null>(null),
      adjustedDscrIcrComment: this.formBuilder.control<NullableString>(null),

      liquidityRisk: this.formBuilder.control<LiquidityRisk | null>('GOOD'),
    },
    {
      validators: [
        this.manualSectionRequiredValidator(),
        this.adjustedDebtToEquityValidator(),
        this.adjustedDscrIcrValidator(),
      ],
    }
  );

  private readonly formValue = toSignal(
    this.amortizingForm.valueChanges.pipe(startWith(this.amortizingForm.getRawValue())),
    { initialValue: this.amortizingForm.getRawValue() }
  );

  readonly manualFields = signal<ManualFieldConfig[]>([
    {
      key: 'seniorGrossFinancialDebt',
      label: $localize`:@@financialDriversSeniorGrossFinancialDebtLabel:Dette Financière Brute Senior`,
      placeholder: $localize`:@@financialDriversSeniorGrossFinancialDebtPlaceholder:Dette Financière Brute Senior`,
      showInfoIcon: true,
    },
    {
      key: 'juniorMezzanineGrossFinancialDebt',
      label: $localize`:@@financialDriversJuniorMezzanineGrossFinancialDebtLabel:Dette Financière Brute Junior/Mezzanine`,
      placeholder: $localize`:@@financialDriversJuniorMezzanineGrossFinancialDebtPlaceholder:Dette Financière Brute Junior/Mezzanine`,
      showInfoIcon: true,
    },
    {
      key: 'equity',
      label: $localize`:@@financialDriversEquityLabel:Fonds Propres`,
      placeholder: $localize`:@@financialDriversEquityPlaceholder:Fonds Propres`,
      showInfoIcon: true,
    },
    {
      key: 'quasiEquity',
      label: $localize`:@@financialDriversQuasiEquityLabel:Quasi-fonds Propres`,
      placeholder: $localize`:@@financialDriversQuasiEquityPlaceholder:Quasi-fonds Propres`,
      showInfoIcon: true,
    },
    {
      key: 'cfads',
      label: $localize`:@@financialDriversCfadsLabel:Cash Flow Available for Debt Service (CFADS)`,
      placeholder: $localize`:@@financialDriversCfadsPlaceholder:Cash Flow Available for Debt Service (CFADS)`,
      showInfoIcon: true,
    },
    {
      key: 'principalPaid',
      label: $localize`:@@financialDriversPrincipalPaidLabel:Principal Paid`,
      placeholder: $localize`:@@financialDriversPrincipalPaidPlaceholder:Principal Paid`,
      positiveOnly: true,
      showInfoIcon: true,
    },
    {
      key: 'interestExpenses',
      label: $localize`:@@financialDriversInterestExpensesLabel:Interest Expenses`,
      placeholder: $localize`:@@financialDriversInterestExpensesPlaceholder:Interest Expenses`,
      positiveOnly: true,
      showInfoIcon: true,
    },
  ]);

  referenceCurrencyUnitList: IItemList[] = [
    {
      label: $localize`:@@currencyUnitsValueThousand:milles`,
      value: 'thousand',
    },
    {
      label: $localize`:@@currencyUnitsValueMillion:millions`,
      value: 'million',
    },
    {
      label: $localize`:@@currencyUnitsValueBillion:milliards`,
      value: 'billion',
    },
    {
      label: $localize`:@@currencyUnitsValueTrillion:billions`,
      value: 'trillion',
    },
  ];

  liquidityRiskOptions: IItemList[] = [
    {
      label: $localize`:@@financialDriversLiquidityRiskExcellentLabel:Excellent (> 12 mois de service de la dette)`,
      value: 'EXCELLENT',
    },
    {
      label: $localize`:@@financialDriversLiquidityRiskGoodLabel:Good (6 - 12 mois de service de la dette)`,
      value: 'GOOD',
    },
    {
      label: $localize`:@@financialDriversLiquidityRiskLimitedLabel:Limited (< 6 mois de service de la dette)`,
      value: 'LIMITED',
    },
  ];

  currencyComboValues: ComboboxField[] = [];
  currencyListWithAllData: ComboboxField[] = [];

  readonly debtToEquityDisplay = computed(() => {
    const value = this.formValue();

    const seniorDebt = this.toNumber(value.seniorGrossFinancialDebt);
    const juniorDebt = this.toNumber(value.juniorMezzanineGrossFinancialDebt);
    const equity = this.toNumber(value.equity);
    const quasiEquity = this.toNumber(value.quasiEquity);

    const denominator = equity + quasiEquity;
    if (denominator === 0) {
      return '/';
    }

    return this.formatRatio((seniorDebt + juniorDebt) / denominator);
  });

  readonly dscrDisplay = computed(() => {
    const value = this.formValue();

    const cfads = this.toNumber(value.cfads);
    const principalPaid = this.toNumber(value.principalPaid);
    const interestExpenses = this.toNumber(value.interestExpenses);

    const denominator = principalPaid + interestExpenses;
    if (denominator === 0) {
      return '/';
    }

    return this.formatRatio(cfads / denominator);
  });

  readonly selectedUnitLabel = computed(() => {
    const unit = this.amortizingForm.controls.unit.value;
    return this.referenceCurrencyUnitList.find(item => item.value === unit)?.label ?? '/';
  });

  readonly selectedCurrencyLabel = computed(() => {
    const currency = this.amortizingForm.controls.currency.value;
    return this.currencyListWithAllData.find(item => item.value === currency)?.label ?? currency ?? '/';
  });

  constructor() {
    this.registerFormInParent();
    this.initCurrencyData();
    this.setupDynamicValidators();
    this.setupValidationRefresh();
  }

  getControl(key: ManualFieldKey): FormControl<NullableNumber> {
    return this.amortizingForm.controls[key];
  }

  onSearchCurrencies(searchTerm: string): void {
    const normalized = (searchTerm ?? '').trim().toLowerCase();

    if (!normalized) {
      this.currencyComboValues = [...this.currencyListWithAllData];
      return;
    }

    this.currencyComboValues = this.currencyListWithAllData.filter(item =>
      item.label.toLowerCase().includes(normalized) ||
      item.value.toLowerCase().includes(normalized)
    );
  }

  onClosingDateChange(event: { value: Date | null }): void {
    this.amortizingForm.controls.closingDate.setValue(event.value);
    this.amortizingForm.controls.closingDate.markAsDirty();
    this.amortizingForm.controls.closingDate.updateValueAndValidity();
  }

  onAdjustedDebtToEquityClosingDateChange(event: { value: Date | null }): void {
    this.amortizingForm.controls.adjustedDebtToEquityClosingDate.setValue(event.value);
    this.amortizingForm.controls.adjustedDebtToEquityClosingDate.markAsDirty();
    this.amortizingForm.controls.adjustedDebtToEquityClosingDate.updateValueAndValidity();
  }

  onAdjustedDscrIcrClosingDateChange(event: { value: Date | null }): void {
    this.amortizingForm.controls.adjustedDscrIcrClosingDate.setValue(event.value);
    this.amortizingForm.controls.adjustedDscrIcrClosingDate.markAsDirty();
    this.amortizingForm.controls.adjustedDscrIcrClosingDate.updateValueAndValidity();
  }

  onLiquidityRiskChange(value: string): void {
    this.amortizingForm.controls.liquidityRisk.setValue(value as LiquidityRisk);
    this.amortizingForm.controls.liquidityRisk.markAsDirty();
  }

  private registerFormInParent(): void {
    this.ratingForm().setControl('financialDrivers', this.amortizingForm);
  }

  private initCurrencyData(): void {
    this.currencyListWithAllData = [
      { label: 'EUR', value: 'EUR' },
      { label: 'USD', value: 'USD' },
      { label: 'GBP', value: 'GBP' },
      { label: 'CHF', value: 'CHF' },
    ];

    this.currencyComboValues = [...this.currencyListWithAllData];
  }

  private setupDynamicValidators(): void {
    this.amortizingForm.controls.principalPaid.addValidators(
      this.positiveStrictValidator(FINANCIAL_DRIVERS_ALERT_KEYS.principalPaidPositive)
    );
    this.amortizingForm.controls.interestExpenses.addValidators(
      this.positiveStrictValidator(FINANCIAL_DRIVERS_ALERT_KEYS.interestExpensesPositive)
    );

    this.amortizingForm.controls.closingDate.addValidators(
      this.max21MonthsOldValidator(FINANCIAL_DRIVERS_ALERT_KEYS.closingDate21Months)
    );
    this.amortizingForm.controls.adjustedDebtToEquityClosingDate.addValidators(
      this.max21MonthsOldValidator(FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquity21Months)
    );
    this.amortizingForm.controls.adjustedDscrIcrClosingDate.addValidators(
      this.max21MonthsOldValidator(FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcr21Months)
    );

    this.amortizingForm.updateValueAndValidity({ emitEvent: false });
  }

  private setupValidationRefresh(): void {
    this.amortizingForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.amortizingForm.updateValueAndValidity({ emitEvent: false });
      });
  }

  private manualSectionRequiredValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const form = group as FormGroup;

      const manualFieldKeys: ManualFieldKey[] = [
        'seniorGrossFinancialDebt',
        'juniorMezzanineGrossFinancialDebt',
        'equity',
        'quasiEquity',
        'cfads',
        'principalPaid',
        'interestExpenses',
      ];

      const hasAtLeastOneManualFieldFilled = manualFieldKeys.some(key =>
        this.hasValue(form.get(key)?.value)
      );

      this.setControlError(
        form.get('unit'),
        FINANCIAL_DRIVERS_ALERT_KEYS.unitRequired,
        hasAtLeastOneManualFieldFilled && !this.hasValue(form.get('unit')?.value)
      );

      this.setControlError(
        form.get('currency'),
        FINANCIAL_DRIVERS_ALERT_KEYS.currencyRequired,
        hasAtLeastOneManualFieldFilled && !this.hasValue(form.get('currency')?.value)
      );

      this.setControlError(
        form.get('closingDate'),
        FINANCIAL_DRIVERS_ALERT_KEYS.closingDateRequired,
        hasAtLeastOneManualFieldFilled && !this.hasValue(form.get('closingDate')?.value)
      );

      return null;
    };
  }

  private adjustedDebtToEquityValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const form = group as FormGroup;
      const adjustedDebtToEquity = form.get('adjustedDebtToEquity')?.value;

      const shouldRequire = this.hasValue(adjustedDebtToEquity);

      this.setControlError(
        form.get('adjustedDebtToEquityClosingDate'),
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityClosingDateRequired,
        shouldRequire && !this.hasValue(form.get('adjustedDebtToEquityClosingDate')?.value)
      );

      this.setControlError(
        form.get('adjustedDebtToEquityComment'),
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDebtToEquityCommentRequired,
        shouldRequire && !this.hasValue(form.get('adjustedDebtToEquityComment')?.value)
      );

      return null;
    };
  }

  private adjustedDscrIcrValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const form = group as FormGroup;
      const adjustedDscrIcr = form.get('adjustedDscrIcr')?.value;

      const shouldRequire = this.hasValue(adjustedDscrIcr);

      this.setControlError(
        form.get('adjustedDscrIcrClosingDate'),
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrClosingDateRequired,
        shouldRequire && !this.hasValue(form.get('adjustedDscrIcrClosingDate')?.value)
      );

      this.setControlError(
        form.get('adjustedDscrIcrComment'),
        FINANCIAL_DRIVERS_ALERT_KEYS.adjustedDscrIcrCommentRequired,
        shouldRequire && !this.hasValue(form.get('adjustedDscrIcrComment')?.value)
      );

      return null;
    };
  }

  private positiveStrictValidator(errorKey: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      if (!this.hasValue(value)) {
        return null;
      }

      return Number(value) > 0 ? null : { [errorKey]: true };
    };
  }

  private max21MonthsOldValidator(errorKey: string): ValidatorFn {
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

  private setControlError(
    control: AbstractControl | null,
    errorKey: string,
    shouldSet: boolean
  ): void {
    if (!control) {
      return;
    }

    const errors = { ...(control.errors ?? {}) };

    if (shouldSet) {
      errors[errorKey] = true;
      control.setErrors(errors);
      return;
    }

    delete errors[errorKey];
    control.setErrors(Object.keys(errors).length ? errors : null);
  }

  private hasValue(value: unknown): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private toNumber(value: unknown): number {
    return typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  }

  private formatRatio(value: number): string {
    return Number.isFinite(value) ? value.toFixed(2) : '/';
  }
}





////




<mat-accordion class="accordion-container" multi hideToggle>
  <mat-expansion-panel class="crf-expansion-panel" #panel [expanded]="true">
    <mat-expansion-panel-header class="workflow-details-panel-header">
      <mat-panel-title>
        <div class="header-panel-container">
          <span class="title-text" i18n="@@financialDriversTitle">Drivers financiers</span>
          <mat-icon class="panel-expand-icon">
            {{ panel.expanded ? 'remove' : 'add' }}
          </mat-icon>
        </div>
      </mat-panel-title>
    </mat-expansion-panel-header>

    <div class="crf-mat-expansion-content">
      <mat-card class="crf-mat-expansion-content-card">
        <mat-card-content>
          <form [formGroup]="amortizingForm">
            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversUnitLabel">Unité</div>

              <div class="row-content">
                <div class="reference-currency-column">
                  <div class="reference-currency-row">
                    <div class="reference-currency-item">
                      <bnpp-workflow-select-list
                        [placeholder]="$localize`:@@financialDriversUnitPlaceholder:Unité`"
                        [itemsList]="referenceCurrencyUnitList"
                        [colorTheme]="'RATING_THEME'"
                        [selectControl]="$any(amortizingForm.get('unit'))"
                      >
                      </bnpp-workflow-select-list>
                    </div>
                  </div>
                </div>

                @if (
                  (amortizingForm.controls.unit.touched || validationInProgress()) &&
                  amortizingForm.controls.unit.errors &&
                  amortizingForm.controls.unit.errors['financialDriversUnitRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversCurrencyLabel">
                Devise
              </div>

              <div class="row-content">
                <bnpp-workflow-autocomplete
                  class="w-100"
                  [placeholder]="$localize`:@@financialDriversCurrencyPlaceholder:Devise`"
                  [itemsList]="currencyComboValues"
                  [autocompleteControl]="$any(amortizingForm.get('currency'))"
                  (inputChangedValueEvent)="onSearchCurrencies($event)"
                  [colorTheme]="'RATING_THEME'"
                >
                </bnpp-workflow-autocomplete>

                @if (
                  (amortizingForm.controls.currency.touched || validationInProgress()) &&
                  amortizingForm.controls.currency.errors &&
                  amortizingForm.controls.currency.errors['financialDriversCurrencyRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversClosingDateLabel">
                Date de clôture
              </div>

              <div class="row-content row-content-full">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="closingDatePicker"
                    [formControl]="amortizingForm.controls.closingDate"
                    (dateChange)="onClosingDateChange($event)"
                    i18n-placeholder="@@financialDriversClosingDatePlaceholder"
                    placeholder="Date de clôture"
                  />
                  <mat-datepicker-toggle
                    matIconSuffix
                    [for]="closingDatePicker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #closingDatePicker></mat-datepicker>
                </mat-form-field>

                @if (
                  (amortizingForm.controls.closingDate.touched || validationInProgress()) &&
                  amortizingForm.controls.closingDate.errors &&
                  amortizingForm.controls.closingDate.errors['financialDriversClosingDateRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }

                @if (
                  (amortizingForm.controls.closingDate.touched || validationInProgress()) &&
                  amortizingForm.controls.closingDate.errors &&
                  amortizingForm.controls.closingDate.errors['financialDriversClosingDate21Months']
                ) {
                  <div class="field-error" i18n="@@fieldIncorrectLabel">
                    Veuillez modifier votre saisie
                  </div>
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
                    [formControl]="getControl(field.key)"
                    [formFieldLabel]="field.placeholder"
                    [placeholderKey]="field.placeholder"
                    [inputType]="'number'"
                  >
                  </bnpp-workflow-input>

                  @if (
                    field.key === 'principalPaid' &&
                    (getControl(field.key).touched || validationInProgress()) &&
                    getControl(field.key).errors &&
                    getControl(field.key).errors['financialDriversPrincipalPaidPositive']
                  ) {
                    <div class="field-error" i18n="@@financialDriversPositiveValueInlineLabel">
                      Ce champ doit être une valeur positive
                    </div>
                  }

                  @if (
                    field.key === 'interestExpenses' &&
                    (getControl(field.key).touched || validationInProgress()) &&
                    getControl(field.key).errors &&
                    getControl(field.key).errors['financialDriversInterestExpensesPositive']
                  ) {
                    <div class="field-error" i18n="@@financialDriversPositiveValueInlineLabel">
                      Ce champ doit être une valeur positive
                    </div>
                  }
                </div>

                <div class="row-content">
                  <div class="data-container readonly-meta-container">
                    <span class="data-text" i18n="@@financialDriversInheritedUnitLabel">
                      Unité héritée
                    </span>
                    <span class="text-capitalize data-indicator">
                      {{ selectedUnitLabel() }}
                    </span>
                  </div>
                </div>

                <div class="row-content">
                  <div class="data-container readonly-meta-container">
                    <span class="data-text" i18n="@@financialDriversInheritedCurrencyLabel">
                      Devise héritée
                    </span>
                    <span class="text-capitalize data-indicator">
                      {{ selectedCurrencyLabel() }}
                    </span>
                  </div>
                </div>
              </div>
            }

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversDataLabel">Data</div>

              <div class="row-content">
                <div class="data-container">
                  <span class="data-text" i18n="@@financialDriversDebtToEquityLabel">
                    Dette sur Capitaux Propres
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ debtToEquityDisplay() }}
                  </span>
                </div>
              </div>

              <div class="row-content">
                <div class="data-container">
                  <span class="data-text" i18n="@@financialDriversDscrLabel">
                    DSCR
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ dscrDisplay() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityLabel">
                Dette sur Capitaux Propres ajustée (si nécessaire)
              </div>

              <div class="row-content">
                <bnpp-workflow-input
                  class="w-100"
                  [formControl]="$any(amortizingForm.get('adjustedDebtToEquity'))"
                  [formFieldLabel]="$localize`:@@financialDriversAdjustedDebtToEquityLabel:Dette sur Capitaux Propres ajustée (si nécessaire)`"
                  [placeholderKey]="$localize`:@@financialDriversAdjustedDebtToEquityPlaceholder:Dette sur Capitaux Propres ajustée`"
                  [inputType]="'number'"
                >
                </bnpp-workflow-input>
              </div>

              <div class="row-content">
                <div class="data-container readonly-meta-container">
                  <span class="data-text" i18n="@@financialDriversInheritedUnitLabel">
                    Unité héritée
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ selectedUnitLabel() }}
                  </span>
                </div>
              </div>

              <div class="row-content">
                <div class="data-container readonly-meta-container">
                  <span class="data-text" i18n="@@financialDriversInheritedCurrencyLabel">
                    Devise héritée
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ selectedCurrencyLabel() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityClosingDateLabel">
                Date de clôture du Debt to Equity ajusté
              </div>

              <div class="row-content row-content-full">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="adjustedDebtToEquityDatePicker"
                    [formControl]="amortizingForm.controls.adjustedDebtToEquityClosingDate"
                    (dateChange)="onAdjustedDebtToEquityClosingDateChange($event)"
                    i18n-placeholder="@@financialDriversAdjustedDebtToEquityClosingDatePlaceholder"
                    placeholder="Date de clôture du Debt to Equity ajusté"
                  />
                  <mat-datepicker-toggle
                    matIconSuffix
                    [for]="adjustedDebtToEquityDatePicker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #adjustedDebtToEquityDatePicker></mat-datepicker>
                </mat-form-field>

                @if (
                  (amortizingForm.controls.adjustedDebtToEquityClosingDate.touched || validationInProgress()) &&
                  amortizingForm.controls.adjustedDebtToEquityClosingDate.errors &&
                  amortizingForm.controls.adjustedDebtToEquityClosingDate.errors['financialDriversAdjustedDebtToEquityClosingDateRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }

                @if (
                  (amortizingForm.controls.adjustedDebtToEquityClosingDate.touched || validationInProgress()) &&
                  amortizingForm.controls.adjustedDebtToEquityClosingDate.errors &&
                  amortizingForm.controls.adjustedDebtToEquityClosingDate.errors['financialDriversAdjustedDebtToEquity21Months']
                ) {
                  <div class="field-error" i18n="@@fieldIncorrectLabel">
                    Veuillez modifier votre saisie
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversAdjustedDebtToEquityCommentLabel">
                Commentaire en cas de Debt to Equity ajusté
              </div>

              <div class="row-content row-content-full">
                <mat-form-field appearance="outline" class="w-100">
                  <textarea
                    matInput
                    rows="3"
                    [formControl]="amortizingForm.controls.adjustedDebtToEquityComment"
                    i18n-placeholder="@@financialDriversAdjustedDebtToEquityCommentPlaceholder"
                    placeholder="Commentaire en cas de Debt to Equity ajusté"
                  ></textarea>
                </mat-form-field>

                @if (
                  (amortizingForm.controls.adjustedDebtToEquityComment.touched || validationInProgress()) &&
                  amortizingForm.controls.adjustedDebtToEquityComment.errors &&
                  amortizingForm.controls.adjustedDebtToEquityComment.errors['financialDriversAdjustedDebtToEquityCommentRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversAdjustedDscrIcrLabel">
                DSCR/ICR ajusté (si nécessaire)
              </div>

              <div class="row-content">
                <bnpp-workflow-input
                  class="w-100"
                  [formControl]="$any(amortizingForm.get('adjustedDscrIcr'))"
                  [formFieldLabel]="$localize`:@@financialDriversAdjustedDscrIcrLabel:DSCR/ICR ajusté (si nécessaire)`"
                  [placeholderKey]="$localize`:@@financialDriversAdjustedDscrIcrPlaceholder:DSCR/ICR ajusté`"
                  [inputType]="'number'"
                >
                </bnpp-workflow-input>
              </div>

              <div class="row-content">
                <div class="data-container readonly-meta-container">
                  <span class="data-text" i18n="@@financialDriversInheritedUnitLabel">
                    Unité héritée
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ selectedUnitLabel() }}
                  </span>
                </div>
              </div>

              <div class="row-content">
                <div class="data-container readonly-meta-container">
                  <span class="data-text" i18n="@@financialDriversInheritedCurrencyLabel">
                    Devise héritée
                  </span>
                  <span class="text-capitalize data-indicator">
                    {{ selectedCurrencyLabel() }}
                  </span>
                </div>
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversAdjustedDscrIcrClosingDateLabel">
                Date d’arrêté de DSCR/ICR ajusté
              </div>

              <div class="row-content row-content-full">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="adjustedDscrDatePicker"
                    [formControl]="amortizingForm.controls.adjustedDscrIcrClosingDate"
                    (dateChange)="onAdjustedDscrIcrClosingDateChange($event)"
                    i18n-placeholder="@@financialDriversAdjustedDscrIcrClosingDatePlaceholder"
                    placeholder="Date d’arrêté de DSCR/ICR ajusté"
                  />
                  <mat-datepicker-toggle
                    matIconSuffix
                    [for]="adjustedDscrDatePicker"
                  ></mat-datepicker-toggle>
                  <mat-datepicker #adjustedDscrDatePicker></mat-datepicker>
                </mat-form-field>

                @if (
                  (amortizingForm.controls.adjustedDscrIcrClosingDate.touched || validationInProgress()) &&
                  amortizingForm.controls.adjustedDscrIcrClosingDate.errors &&
                  amortizingForm.controls.adjustedDscrIcrClosingDate.errors['financialDriversAdjustedDscrIcrClosingDateRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }

                @if (
                  (amortizingForm.controls.adjustedDscrIcrClosingDate.touched || validationInProgress()) &&
                  amortizingForm.controls.adjustedDscrIcrClosingDate.errors &&
                  amortizingForm.controls.adjustedDscrIcrClosingDate.errors['financialDriversAdjustedDscrIcr21Months']
                ) {
                  <div class="field-error" i18n="@@fieldIncorrectLabel">
                    Veuillez modifier votre saisie
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversAdjustedDscrIcrCommentLabel">
                Commentaire en cas de DSCR/ICR ajusté
              </div>

              <div class="row-content row-content-full">
                <mat-form-field appearance="outline" class="w-100">
                  <textarea
                    matInput
                    rows="3"
                    [formControl]="amortizingForm.controls.adjustedDscrIcrComment"
                    i18n-placeholder="@@financialDriversAdjustedDscrIcrCommentPlaceholder"
                    placeholder="Commentaire en cas de DSCR/ICR ajusté"
                  ></textarea>
                </mat-form-field>

                @if (
                  (amortizingForm.controls.adjustedDscrIcrComment.touched || validationInProgress()) &&
                  amortizingForm.controls.adjustedDscrIcrComment.errors &&
                  amortizingForm.controls.adjustedDscrIcrComment.errors['financialDriversAdjustedDscrIcrCommentRequired']
                ) {
                  <div class="field-error" i18n="@@fieldMissingErrorLabel">
                    Ce champ est manquant
                  </div>
                }
              </div>
            </div>

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@financialDriversLiquidityRiskLabel">
                Risque de liquidité (LR)
              </div>

              <div class="row-content row-content-full">
                <div class="chips-container">
                  @for (option of liquidityRiskOptions; track option.value) {
                    <button
                      type="button"
                      class="chip-button"
                      [class.selected]="amortizingForm.controls.liquidityRisk.value === option.value"
                      (click)="onLiquidityRiskChange(option.value)"
                    >
                      {{ option.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  </mat-expansion-panel>
</mat-accordion>


                      ////


  export const WORKFLOW_ALERTS_MESSAGES = {
  // ... existant

  financialDriversUnitRequired: $localize`:@@financialDriversUnitRequiredAlert:Drivers financiers : le champ Unité est obligatoire.`,
  financialDriversCurrencyRequired: $localize`:@@financialDriversCurrencyRequiredAlert:Drivers financiers : le champ Devise est obligatoire.`,
  financialDriversClosingDateRequired: $localize`:@@financialDriversClosingDateRequiredAlert:Drivers financiers : le champ Date de clôture est obligatoire.`,

  financialDriversClosingDate21Months: $localize`:@@financialDriversClosingDate21MonthsAlert:La date des données financières doit être récente (moins de 21 mois), merci de modifier votre saisie.`,

  financialDriversPrincipalPaidPositive: $localize`:@@financialDriversPrincipalPaidPositiveAlert:Principal Paid doit être une valeur positive.`,
  financialDriversInterestExpensesPositive: $localize`:@@financialDriversInterestExpensesPositiveAlert:Interest Expenses doit être une valeur positive.`,

  financialDriversAdjustedDebtToEquityClosingDateRequired: $localize`:@@financialDriversAdjustedDebtToEquityClosingDateRequiredAlert:Drivers financiers : le champ Date de clôture du Debt to Equity ajusté est obligatoire.`,
  financialDriversAdjustedDebtToEquityCommentRequired: $localize`:@@financialDriversAdjustedDebtToEquityCommentRequiredAlert:Drivers financiers : le champ Commentaire en cas de Debt to Equity ajusté est obligatoire.`,
  financialDriversAdjustedDebtToEquity21Months: $localize`:@@financialDriversAdjustedDebtToEquity21MonthsAlert:La date du ratio Debt-to-Equity doit être récente (21 mois), veuillez modifier votre saisie.`,

  financialDriversAdjustedDscrIcrClosingDateRequired: $localize`:@@financialDriversAdjustedDscrIcrClosingDateRequiredAlert:Drivers financiers : le champ Date d’arrêté de DSCR/ICR ajusté est obligatoire.`,
  financialDriversAdjustedDscrIcrCommentRequired: $localize`:@@financialDriversAdjustedDscrIcrCommentRequiredAlert:Drivers financiers : le champ Commentaire en cas de DSCR/ICR ajusté est obligatoire.`,
  financialDriversAdjustedDscrIcr21Months: $localize`:@@financialDriversAdjustedDscrIcr21MonthsAlert:La date d’arrêté de DSCR / ICR ajusté doit être récente (moins de 21 mois), merci de modifier votre saisie.`,
};




////


export const customErrorMessages: Record<string, Record<string, string>> = {
  // ... existant

  unit: {
    required: 'financialDriversUnitRequired',
  },
  currency: {
    required: 'financialDriversCurrencyRequired',
  },
  closingDate: {
    required: 'financialDriversClosingDateRequired',
  },
  adjustedDebtToEquityClosingDate: {
    required: 'financialDriversAdjustedDebtToEquityClosingDateRequired',
  },
  adjustedDebtToEquityComment: {
    required: 'financialDriversAdjustedDebtToEquityCommentRequired',
  },
  adjustedDscrIcrClosingDate: {
    required: 'financialDriversAdjustedDscrIcrClosingDateRequired',
  },
  adjustedDscrIcrComment: {
    required: 'financialDriversAdjustedDscrIcrCommentRequired',
  },
};
