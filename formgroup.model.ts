import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkflowDocument } from '@lazyloaded/counterparty/model/crf-workflow-document';
import { ExternalRatingSource, SponsorInvolvement, SponsorType } from '@lazyloaded/counterparty/model/project-finance-rating/project-finance.model';
import { ISelectionOption } from '@shared/components/workflow-selection/workflow-selection.component';
import { IItemList } from '@shared/model/item-list.model';
import { MaterialModule } from '@shared/modules/MaterialModule';
import { startWith } from 'rxjs';

@Component({
  selector: 'bnpp-external-sponsor',
  templateUrl: './external-sponsor.component.html',
  styleUrls: ['./external-sponsor.component.scss'],
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
})
export class ExternalSponsorComponent implements OnInit {
  // ─── DI ──────────────────────────────────────────────────────────
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  // ─── Inputs ──────────────────────────────────────────────────────
  ratingForm = input.required<FormGroup>();
  workflowDTO = input.required<WorkflowDocument>();
  validationInProgress = input<boolean>();
  maxChars = input<number>();

  // ─── Form ─────────────────────────────────────────────────────────
  readonly externalSponsorForm = this.formBuilder.group({
    // BR01 — always shown
    sponsorName:            this.formBuilder.control<string | null>(null, Validators.required),
    hasExternalRating:      this.formBuilder.control<boolean | null>(null, Validators.required),
    commentOnExternalData:  this.formBuilder.control<string | null>(null, Validators.required),
    // BR02 — shown when hasExternalRating = true
    externalRatingSource:   this.formBuilder.control<ExternalRatingSource | null>(null),
    externalRating:         this.formBuilder.control<string | null>(null),
    externalRatingDate:     this.formBuilder.control<Date | null>(null),
    // BR03 — shown when hasExternalRating = false
    sponsorType:            this.formBuilder.control<SponsorType | null>(null),
    // BR04 — Corporate → Turnover
    sponsorTurnover:                        this.formBuilder.control<number | null>(null),
    sponsorTurnoverUnit:                    this.formBuilder.control<string | null>(null),
    sponsorTurnoverCurrency:                this.formBuilder.control<string | null>(null),
    sponsorTurnoverClosingDate:             this.formBuilder.control<Date | null>(null),
    // BR04 — Adjusted Turnover (optional; sub-fields required when amount filled)
    adjustedSponsorTurnover:                this.formBuilder.control<number | null>(null),
    adjustedSponsorTurnoverUnit:            this.formBuilder.control<string | null>(null),
    adjustedSponsorTurnoverCurrency:        this.formBuilder.control<string | null>(null),
    adjustedSponsorTurnoverClosingDate:     this.formBuilder.control<Date | null>(null),
    adjustedSponsorTurnoverOverrideComment: this.formBuilder.control<string | null>(null),
    // BR05 — Other → Assets Under Management
    assetsUnderManagement:              this.formBuilder.control<number | null>(null),
    assetsUnderManagementUnit:          this.formBuilder.control<string | null>(null),
    assetsUnderManagementCurrency:      this.formBuilder.control<string | null>(null),
    assetsUnderManagementClosingDate:   this.formBuilder.control<Date | null>(null),
    // BR06 — always shown
    sponsorInvolvement: this.formBuilder.control<SponsorInvolvement | null>(null, Validators.required),
    // BR07 — auto-computed, read-only
    sponsorStrength:    this.formBuilder.control<string | null>({ value: null, disabled: true }),
  });

  // ─── Cascade-reset ordered list ───────────────────────────────────
  private readonly controlFlow: (keyof typeof this.externalSponsorForm.controls)[] = [
    'hasExternalRating',
    'externalRatingSource', 'externalRating', 'externalRatingDate',
    'sponsorType',
    'sponsorTurnover', 'sponsorTurnoverUnit', 'sponsorTurnoverCurrency', 'sponsorTurnoverClosingDate',
    'adjustedSponsorTurnover', 'adjustedSponsorTurnoverUnit', 'adjustedSponsorTurnoverCurrency',
    'adjustedSponsorTurnoverClosingDate', 'adjustedSponsorTurnoverOverrideComment',
    'assetsUnderManagement', 'assetsUnderManagementUnit', 'assetsUnderManagementCurrency',
    'assetsUnderManagementClosingDate',
  ];

  private previousFormValue = this.externalSponsorForm.getRawValue();
  private isResettingDescendants = false;

  // ─── Form value as Signal (ProjectPhase pattern) ──────────────────
  readonly formValue = toSignal(
    this.externalSponsorForm.valueChanges.pipe(
      startWith(this.externalSponsorForm.getRawValue())
    ),
    { initialValue: this.externalSponsorForm.getRawValue() }
  );

  // ─── Computed show/hide ───────────────────────────────────────────
  readonly showExternalRatingFields = computed(
    () => this.formValue().hasExternalRating === true
  );

  readonly showExternalRatingValues = computed(
    () => this.showExternalRatingFields() && this.hasValue(this.formValue().externalRatingSource)
  );

  readonly showSponsorType = computed(
    () => this.formValue().hasExternalRating === false
  );

  readonly showTurnoverFields = computed(
    () => this.showSponsorType() && this.formValue().sponsorType === 'CORPORATE'
  );

  readonly showAdjustedTurnoverSubFields = computed(
    () => this.showTurnoverFields() && this.hasValue(this.formValue().adjustedSponsorTurnover)
  );

  readonly showAUMFields = computed(
    () => this.showSponsorType() && this.formValue().sponsorType === 'OTHER'
  );

  // Non-blocking date warnings (> 21 months)
  readonly showTurnoverDateWarning = computed(
    () => this.showTurnoverFields() && this.isOlderThan21Months(this.formValue().sponsorTurnoverClosingDate)
  );
  readonly showAdjustedTurnoverDateWarning = computed(
    () => this.showAdjustedTurnoverSubFields() && this.isOlderThan21Months(this.formValue().adjustedSponsorTurnoverClosingDate)
  );
  readonly showAUMDateWarning = computed(
    () => this.showAUMFields()
      && this.hasValue(this.formValue().assetsUnderManagement)
      && this.isOlderThan21Months(this.formValue().assetsUnderManagementClosingDate)
  );

  // Dropdown options auto-update when rating source changes
  readonly externalRatingOptions = computed(
    () => this.getRatingOptionsForSource(this.formValue().externalRatingSource)
  );

  // ─── Currency state ───────────────────────────────────────────────
  currencyList: IItemList[] = [];
  filteredCurrencyList: IItemList[] = [];
  sponsorTurnoverCurrencyInitialValue: IItemList | null = null;
  adjustedSponsorTurnoverCurrencyInitialValue: IItemList | null = null;
  assetUnderManagementCurrencyInitialValue: IItemList | null = null;

  // ─── Static options ───────────────────────────────────────────────
  readonly hasExternalRatingOptions: ISelectionOption[] = [
    { label: $localize`:common true response@@CommonTrue:`,  value: true,  iconName: 'check' },
    { label: $localize`:common false response@@CommonFalse:`, value: false, iconName: 'icon' },
  ];

  readonly externalRatingSourceOptions: ISelectionOption[] = [
    { label: 'Fitch',    value: 'FITCH'  as ExternalRatingSource },
    { label: "Moody's",  value: 'MOODYS' as ExternalRatingSource },
    { label: 'S&P',      value: 'SP'     as ExternalRatingSource },
  ];

  readonly sponsorTypeOptions: ISelectionOption[] = [
    { label: 'Corporate', value: 'CORPORATE' as SponsorType },
    { label: 'Other',     value: 'OTHER'     as SponsorType },
  ];

  readonly referenceCurrencyUnitList: IItemList[] = [
    { label: $localize`:@@unitLabel:Unité`,                           value: 'UNIT'     },
    { label: $localize`:@@currencyUnitsValueThousand:milles`,         value: 'thousand' },
    { label: $localize`:@@currencyUnitsValueMillion:millions`,        value: 'million'  },
    { label: $localize`:@@currencyUnitsValueBillion:milliards`,       value: 'billion'  },
    { label: $localize`:@@currencyUnitsValueTrillion:billions`,       value: 'trillion' },
  ];

  readonly sponsorInvolvementOptions: ISelectionOption[] = [
    { label: 'Completion Guarantor',                value: 'COMPLETION_GUARANTOR'               as SponsorInvolvement },
    { label: 'Offtaker',                            value: 'OFFTAKER'                           as SponsorInvolvement },
    { label: 'EPC Contractor',                      value: 'EPC_CONTRACTOR'                     as SponsorInvolvement },
    { label: 'Operator',                            value: 'OPERATOR'                           as SponsorInvolvement },
    { label: 'Other Type of operational involvement', value: 'OTHER_TYPE_OF_OPERATIONAL_INVOLVEMENT' as SponsorInvolvement },
  ];

  protected readonly currencyPlaceholder          = $localize`:@@facilityCurrency:Devise`;
  protected readonly referenceCurrencyPlaceholder = $localize`:@@facilityUnit:Unité`;
  protected readonly closingDatePlaceholder        = $localize`:@@closingDateLabel:Date d'arrêté`;
  protected readonly commentPlaceholder            = 'Add a comment to justify the Sponsor Turnover override';

  // ─── Lifecycle ────────────────────────────────────────────────────
  ngOnInit(): void {
    this.initFormValues();
    this.registerFormInParent();
    this.initPreviousFormValue();
    this.setupDependentControlReset();
    this.updateDynamicValidatorsAndResets();
  }

  // ─── Init ─────────────────────────────────────────────────────────
  private initFormValues(): void {
    const rating = this.workflowDTO().counterPartyRating;
    if (!rating?.sponsorEntityInfo) return;
    const info = rating.sponsorEntityInfo;
    const ext  = info.externalRatingDetails;

    this.externalSponsorForm.patchValue({
      sponsorName:                            ext?.sponsorName                          ?? null,
      hasExternalRating:                      ext?.hasExternalRating                    ?? null,
      commentOnExternalData:                  ext?.commentOnExternalData                ?? null,
      externalRatingSource:                   ext?.externalRatingSource                 ?? null,
      externalRating:                         ext?.externalRating                       ?? null,
      externalRatingDate:                     ext?.externalRatingDate                   ?? null,
      sponsorType:                            info.sponsorType                          ?? null,
      sponsorTurnover:                        info.sponsorTurnover?.amount              ?? null,
      sponsorTurnoverUnit:                    info.sponsorTurnover?.unit                ?? null,
      sponsorTurnoverCurrency:                info.sponsorTurnover?.currency            ?? null,
      sponsorTurnoverClosingDate:             info.sponsorTurnoverClosingDate            ?? null,
      adjustedSponsorTurnover:                info.adjustedSponsorTurnover?.amount      ?? null,
      adjustedSponsorTurnoverUnit:            info.adjustedSponsorTurnover?.unit        ?? null,
      adjustedSponsorTurnoverCurrency:        info.adjustedSponsorTurnover?.currency    ?? null,
      adjustedSponsorTurnoverClosingDate:     info.adjustedSponsorTurnoverClosingDate    ?? null,
      adjustedSponsorTurnoverOverrideComment: info.adjustedSponsorTurnoverOverrideComment ?? null,
      assetsUnderManagement:                  info.assetsUnderManagement?.amount        ?? null,
      assetsUnderManagementUnit:              info.assetsUnderManagement?.unit          ?? null,
      assetsUnderManagementCurrency:          info.assetsUnderManagement?.currency      ?? null,
      assetsUnderManagementClosingDate:       info.assetsUnderManagementClosingDate      ?? null,
      sponsorInvolvement:                     info.sponsorInvolvement                   ?? null,
      sponsorStrength:                        info.sponsorStrength                      ?? null,
    });

    // Seed autocomplete initial values
    if (info.sponsorTurnover?.currency)
      this.sponsorTurnoverCurrencyInitialValue = { value: info.sponsorTurnover.currency, label: info.sponsorTurnover.currency };
    if (info.adjustedSponsorTurnover?.currency)
      this.adjustedSponsorTurnoverCurrencyInitialValue = { value: info.adjustedSponsorTurnover.currency, label: info.adjustedSponsorTurnover.currency };
    if (info.assetsUnderManagement?.currency)
      this.assetUnderManagementCurrencyInitialValue = { value: info.assetsUnderManagement.currency, label: info.assetsUnderManagement.currency };
  }

  private registerFormInParent(): void {
    this.ratingForm().setControl('sponsorEntity', this.externalSponsorForm);
  }

  private initPreviousFormValue(): void {
    this.previousFormValue = this.externalSponsorForm.getRawValue();
  }

  // ─── Reactive cascade reset ───────────────────────────────────────
  private setupDependentControlReset(): void {
    this.externalSponsorForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(currentValue => {
        if (this.isResettingDescendants) {
          this.previousFormValue = this.externalSponsorForm.getRawValue();
          this.updateDynamicValidatorsAndResets();
          return;
        }
        this.isResettingDescendants = true;
        this.clearDescendantsFromFirstChangedControl(this.previousFormValue, currentValue);
        this.isResettingDescendants = false;
        this.updateDynamicValidatorsAndResets();
        this.previousFormValue = this.externalSponsorForm.getRawValue();
      });
  }

  updateDynamicValidatorsAndResets(): void {
    const c = this.externalSponsorForm.controls;
    const v = this.formValue();

    const showExtRating = v.hasExternalRating === true;
    const showType      = v.hasExternalRating === false;
    const isCorporate   = showType && v.sponsorType === 'CORPORATE';
    const isOther       = showType && v.sponsorType === 'OTHER';
    const hasTurnover   = this.hasValue(v.sponsorTurnover);
    const hasAdjusted   = this.hasValue(v.adjustedSponsorTurnover);
    const hasAUM        = this.hasValue(v.assetsUnderManagement);

    // Always required
    this.setRequired(c.sponsorName,           true);
    this.setRequired(c.hasExternalRating,     true);
    this.setRequired(c.commentOnExternalData, true);
    this.setRequired(c.sponsorInvolvement,    true);

    // BR02
    this.setRequired(c.externalRatingSource, showExtRating); this.resetIfHidden(c.externalRatingSource, showExtRating);
    this.setRequired(c.externalRating,       showExtRating); this.resetIfHidden(c.externalRating,       showExtRating);
    this.setRequired(c.externalRatingDate,   showExtRating); this.resetIfHidden(c.externalRatingDate,   showExtRating);

    // BR03
    this.setRequired(c.sponsorType, showType); this.resetIfHidden(c.sponsorType, showType);

    // BR04 — Turnover
    this.resetIfHidden(c.sponsorTurnover,          isCorporate);
    this.setRequired(c.sponsorTurnoverUnit,         isCorporate && hasTurnover); this.resetIfHidden(c.sponsorTurnoverUnit,         isCorporate);
    this.setRequired(c.sponsorTurnoverCurrency,     isCorporate && hasTurnover); this.resetIfHidden(c.sponsorTurnoverCurrency,     isCorporate);
    this.setRequired(c.sponsorTurnoverClosingDate,  isCorporate && hasTurnover); this.resetIfHidden(c.sponsorTurnoverClosingDate,  isCorporate);

    // BR04 — Adjusted
    this.resetIfHidden(c.adjustedSponsorTurnover,                isCorporate);
    this.setRequired(c.adjustedSponsorTurnoverUnit,               isCorporate && hasAdjusted); this.resetIfHidden(c.adjustedSponsorTurnoverUnit,               isCorporate);
    this.setRequired(c.adjustedSponsorTurnoverCurrency,           isCorporate && hasAdjusted); this.resetIfHidden(c.adjustedSponsorTurnoverCurrency,           isCorporate);
    this.setRequired(c.adjustedSponsorTurnoverClosingDate,        isCorporate && hasAdjusted); this.resetIfHidden(c.adjustedSponsorTurnoverClosingDate,        isCorporate);
    this.setRequired(c.adjustedSponsorTurnoverOverrideComment,    isCorporate && hasAdjusted); this.resetIfHidden(c.adjustedSponsorTurnoverOverrideComment,    isCorporate && hasAdjusted);

    // BR05 — AUM
    this.resetIfHidden(c.assetsUnderManagement,         isOther);
    this.setRequired(c.assetsUnderManagementUnit,        isOther && hasAUM); this.resetIfHidden(c.assetsUnderManagementUnit,        isOther);
    this.setRequired(c.assetsUnderManagementCurrency,    isOther && hasAUM); this.resetIfHidden(c.assetsUnderManagementCurrency,    isOther);
    this.setRequired(c.assetsUnderManagementClosingDate, isOther && hasAUM); this.resetIfHidden(c.assetsUnderManagementClosingDate, isOther);
  }

  // ─── Utility helpers (mirrors ProjectPhase) ───────────────────────
  private setRequired(ctrl: FormControl, required: boolean): void {
    if (required) ctrl.setValidators([Validators.required]);
    else ctrl.clearValidators();
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private clearControl(ctrl: FormControl): void {
    ctrl.setValue(null);
    ctrl.markAsPristine();
    ctrl.markAsUntouched();
  }

  private clearDescendantsFromFirstChangedControl(previous: any, current: any): void {
    const changedIndex = this.controlFlow.findIndex(
      controlName => previous?.[controlName] !== current?.[controlName]
    );
    if (changedIndex === -1) return;
    this.controlFlow
      .slice(changedIndex + 1)
      .forEach(controlName =>
        this.clearControl(this.externalSponsorForm.controls[controlName] as FormControl)
      );
  }

  private resetIfHidden(ctrl: FormControl, visible: boolean): void {
    if (visible) return;
    ctrl.setValue(null, { emitEvent: false });
    ctrl.removeValidators(Validators.required);
    ctrl.markAsPristine();
    ctrl.markAsUntouched();
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private hasValue(v: unknown): boolean {
    return v !== null && v !== undefined && v !== '';
  }

  private isOlderThan21Months(date: Date | null | undefined): boolean {
    if (!date) return false;
    const limit = new Date();
    limit.setMonth(limit.getMonth() - 21);
    return new Date(date) < limit;
  }

  // ─── Currency search ──────────────────────────────────────────────
  onCurrencySearch(searchedValue: string): void {
    this.filteredCurrencyList = this.currencyList.filter(c =>
      c.label?.toUpperCase().includes(searchedValue?.toUpperCase() ?? '')
    );
  }

  // ─── Rating options per source ────────────────────────────────────
  private getRatingOptionsForSource(source: ExternalRatingSource | null | undefined): ISelectionOption[] {
    switch (source) {
      case 'FITCH':
      case 'SP':
        return ['AAA','AA+','AA','AA-','A+','A','A-','BBB+','BBB','BBB-','BB+','BB','BB-','B+','B','B-','CCC+','CCC','CCC-','CC','C','D']
          .map(r => ({ label: r, value: r }));
      case 'MOODYS':
        return ['Aaa','Aa1','Aa2','Aa3','A1','A2','A3','Baa1','Baa2','Baa3','Ba1','Ba2','Ba3','B1','B2','B3','Caa1','Caa2','Caa3','Ca','C']
          .map(r => ({ label: r, value: r }));
      default:
        return [];
    }
  }
}



html:


<!-- ─── BR01: Sponsor Name ─────────────────────────────────────────── -->
<div class="row-item">
  <div class="row-label" i18n="title for sponsor name label@@sponsorNameLabel">Nom du sponsor</div>
  <div class="row-content">
    <bnpp-workflow-input
      class="w-100"
      [formControl]="$any(externalSponsorForm.get('sponsorName'))"
      [formFieldLabel]="'sponsorNameLabel'"
      [placeholderKey]="'sponsorNameLabel'"
      [inputType]="'text'"
    ></bnpp-workflow-input>
  </div>
  @if (
    (externalSponsorForm.controls.sponsorName.touched || validationInProgress()) &&
    externalSponsorForm.controls.sponsorName.errors?.['required']
  ) {
    <div class="field-error-container">
      <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
    </div>
  }
</div>

<!-- ─── BR01: Has External Rating ─────────────────────────────────── -->
<div class="row-item">
  <div class="row-label" i18n="title for has external rating@@hasExternalRatingLabel">
    Le sponsor a-t-il une notation externe ?
  </div>
  <div class="row-content">
    <div class="w-100">
      <bnpp-workflow-selection
        class="w-100"
        [options]="hasExternalRatingOptions"
        [selectionControl]="$any(externalSponsorForm.get('hasExternalRating'))"
        aria-required="true"
      ></bnpp-workflow-selection>
    </div>
  </div>
  @if (
    (externalSponsorForm.controls.hasExternalRating.touched || validationInProgress()) &&
    externalSponsorForm.controls.hasExternalRating.errors?.['required']
  ) {
    <div class="field-error-container">
      <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
    </div>
  }
</div>

<!-- ─── BR02: External Rating Fields (YES branch) ─────────────────── -->
@if (showExternalRatingFields()) {
  <!-- External rating source -->
  <div class="row-item">
    <div class="row-label" i18n="title for external rating source label@@externalRatingSourceLabel">
      Source de la notation externe
    </div>
    <div class="row-content">
      <div class="w-100">
        <bnpp-workflow-selection
          class="w-100"
          [options]="externalRatingSourceOptions"
          [selectionControl]="$any(externalSponsorForm.get('externalRatingSource'))"
          aria-required="true"
        ></bnpp-workflow-selection>
      </div>
    </div>
    @if (
      (externalSponsorForm.controls.externalRatingSource.touched || validationInProgress()) &&
      externalSponsorForm.controls.externalRatingSource.errors?.['required']
    ) {
      <div class="field-error-container">
        <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
      </div>
    }
  </div>

  <!-- External rating value + date (same row, source must be selected first) -->
  @if (showExternalRatingValues()) {
    <div class="row-item">
      <div class="row-label" i18n="title for external rating label@@externalRatingLabel">
        Notation sponsor externe
      </div>
      <div class="row-content d-flex gap-2">
        <!-- Rating dropdown -->
        <div class="w-50">
          <bnpp-workflow-select-list
            [placeholder]="'externalRatingLabel'"
            [itemsList]="externalRatingOptions()"
            [selectControl]="$any(externalSponsorForm.get('externalRating'))"
          ></bnpp-workflow-select-list>
        </div>
        <!-- Rating date -->
        <div class="w-50">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="externalRatingDatePicker"
              [formControl]="$any(externalSponsorForm.get('externalRatingDate'))"
              class="horizontal-center"
              [placeholder]="closingDatePlaceholder"
              i18n-placeholder="@@closingDateLabel"
            />
            <mat-datepicker-toggle matIconSuffix [for]="externalRatingDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #externalRatingDatePicker panelClass="'customized-date-panel'"></mat-datepicker>
          </mat-form-field>
        </div>
      </div>
      @if (
        (externalSponsorForm.controls.externalRating.touched || validationInProgress()) &&
        externalSponsorForm.controls.externalRating.errors?.['required']
      ) {
        <div class="field-error-container">
          <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
        </div>
      }
      @if (
        (externalSponsorForm.controls.externalRatingDate.touched || validationInProgress()) &&
        externalSponsorForm.controls.externalRatingDate.errors?.['required']
      ) {
        <div class="field-error-container">
          <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
        </div>
      }
    </div>
  }
}

<!-- ─── BR01: Comment on external data (always shown) ─────────────── -->
<div class="row-item">
  <div class="row-label" i18n="title for comment on external data@@commentOnExternalDataLabel">
    Commentaire en cas de données externes
  </div>
  <div class="row-content">
    <mat-form-field appearance="outline" class="w-100">
      <textarea
        matInput
        [formControl]="$any(externalSponsorForm.get('commentOnExternalData'))"
        [maxlength]="maxChars() ?? 200"
        rows="4"
      ></textarea>
    </mat-form-field>
  </div>
  @if (
    (externalSponsorForm.controls.commentOnExternalData.touched || validationInProgress()) &&
    externalSponsorForm.controls.commentOnExternalData.errors?.['required']
  ) {
    <div class="field-error-container">
      <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
    </div>
  }
</div>

<!-- ─── BR03: Sponsor Type (NO branch) ────────────────────────────── -->
@if (showSponsorType()) {
  <div class="row-item">
    <div class="row-label">Sponsor Type</div>
    <div class="row-content">
      <bnpp-workflow-selection
        class="w-100"
        [options]="sponsorTypeOptions"
        [selectionControl]="$any(externalSponsorForm.get('sponsorType'))"
        aria-required="true"
      ></bnpp-workflow-selection>
    </div>
    @if (
      (externalSponsorForm.controls.sponsorType.touched || validationInProgress()) &&
      externalSponsorForm.controls.sponsorType.errors?.['required']
    ) {
      <div class="field-error-container">
        <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
      </div>
    }
  </div>

  <!-- ─── BR04: Corporate → Turnover ──────────────────────────────── -->
  @if (showTurnoverFields()) {
    <!-- Sponsor Turnover (Sales) -->
    <div class="row-item">
      <div class="row-label" i18n="title for sponsor turnover label@@sponsorTurnoverLabel">
        Le chiffre d'affaires du sponsor
      </div>
      <div class="row-content">
        <bnpp-workflow-input
          class="w-100"
          [formControl]="$any(externalSponsorForm.get('sponsorTurnover'))"
          [formFieldLabel]="'sponsorTurnoverLabel'"
          [placeholderKey]="'sponsorTurnoverLabel'"
          [inputType]="'number'"
        ></bnpp-workflow-input>
      </div>
      <div class="row-content">
        <div class="currency-column">
          <div class="currency-row">
            <!-- Unit -->
            <div class="currency-item">
              <bnpp-workflow-select-list
                [placeholder]="referenceCurrencyPlaceholder"
                [itemsList]="referenceCurrencyUnitList"
                [selectControl]="$any(externalSponsorForm.get('sponsorTurnoverUnit'))"
              ></bnpp-workflow-select-list>
            </div>
          </div>
        </div>
      </div>
      <!-- Currency autocomplete -->
      <div class="row-content">
        <bnpp-workflow-autocomplete
          class="w-100"
          [placeholder]="currencyPlaceholder"
          [itemsList]="filteredCurrencyList"
          [initialValue]="sponsorTurnoverCurrencyInitialValue"
          [autocompleteControl]="$any(externalSponsorForm.get('sponsorTurnoverCurrency'))"
          (inputChangedValueEvent)="onCurrencySearch($event)"
        ></bnpp-workflow-autocomplete>
      </div>
      @if (
        (externalSponsorForm.controls.sponsorTurnoverUnit.touched || validationInProgress()) &&
        externalSponsorForm.controls.sponsorTurnoverUnit.errors?.['required']
      ) {
        <div class="field-error-container">
          <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
        </div>
      }
    </div>

    <!-- Sponsor Turnover Closing Date -->
    <div class="row-item">
      <div class="row-label" i18n="title for sponsor turnover closing date label@@sponsorTurnoverClosingDateLabel">
        Le chiffre d'affaires du sponsor date d'arrêté
      </div>
      <div class="row-content">
        <mat-form-field appearance="outline" class="w-100 date-field">
          <input
            matInput
            [matDatepicker]="sponsorTurnoverClosingDate"
            [formControl]="$any(externalSponsorForm.get('sponsorTurnoverClosingDate'))"
            class="horizontal-center"
            [placeholder]="closingDatePlaceholder"
            i18n-placeholder="@@closingDateLabel"
          />
          <mat-datepicker-toggle matIconSuffix [for]="sponsorTurnoverClosingDate"></mat-datepicker-toggle>
          <mat-datepicker #sponsorTurnoverClosingDate panelClass="'customized-date-panel'"></mat-datepicker>
        </mat-form-field>
      </div>
      @if (
        (externalSponsorForm.controls.sponsorTurnoverClosingDate.touched || validationInProgress()) &&
        externalSponsorForm.controls.sponsorTurnoverClosingDate.errors?.['required']
      ) {
        <div class="field-error-container">
          <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
        </div>
      }
      <!-- ⚠ Non-blocking warning: date > 21 months -->
      @if (showTurnoverDateWarning()) {
        <div class="field-warning-container">
          <span class="warning-text" i18n="@@closingDate21MonthsWarning">
            La date d'arrêté saisie dépasse 21 mois - Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
          </span>
        </div>
      }
    </div>

    <!-- Adjusted Sponsor Turnover -->
    <div class="row-item">
      <div class="row-label" i18n="title for adjusted sponsor turnover label@@adjustedSponsorTurnoverLabel">
        Le chiffre d'affaires ajusté du sponsor
      </div>
      <div class="row-content">
        <bnpp-workflow-input
          class="w-100"
          [formControl]="$any(externalSponsorForm.get('adjustedSponsorTurnover'))"
          [formFieldLabel]="'adjustedSponsorTurnoverLabel'"
          [placeholderKey]="'adjustedSponsorTurnoverLabel'"
          [inputType]="'number'"
        ></bnpp-workflow-input>
      </div>

      <!-- Sub-fields mandatory only when adjusted amount is filled -->
      @if (showAdjustedTurnoverSubFields()) {
        <div class="row-content">
          <div class="currency-column">
            <div class="currency-row">
              <div class="currency-item">
                <bnpp-workflow-select-list
                  [placeholder]="referenceCurrencyPlaceholder"
                  [itemsList]="referenceCurrencyUnitList"
                  [selectControl]="$any(externalSponsorForm.get('adjustedSponsorTurnoverUnit'))"
                ></bnpp-workflow-select-list>
              </div>
            </div>
          </div>
        </div>
        <div class="row-content">
          <bnpp-workflow-autocomplete
            class="w-100"
            [placeholder]="currencyPlaceholder"
            [itemsList]="filteredCurrencyList"
            [initialValue]="adjustedSponsorTurnoverCurrencyInitialValue"
            [autocompleteControl]="$any(externalSponsorForm.get('adjustedSponsorTurnoverCurrency'))"
            (inputChangedValueEvent)="onCurrencySearch($event)"
          ></bnpp-workflow-autocomplete>
        </div>
        <!-- Closing date -->
        <div class="row-content">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="adjustedTurnoverClosingDatePicker"
              [formControl]="$any(externalSponsorForm.get('adjustedSponsorTurnoverClosingDate'))"
              class="horizontal-center"
              [placeholder]="closingDatePlaceholder"
            />
            <mat-datepicker-toggle matIconSuffix [for]="adjustedTurnoverClosingDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #adjustedTurnoverClosingDatePicker panelClass="'customized-date-panel'"></mat-datepicker>
          </mat-form-field>
        </div>
        @if (showAdjustedTurnoverDateWarning()) {
          <div class="field-warning-container">
            <span class="warning-text" i18n="@@closingDate21MonthsWarning">
              La date d'arrêté saisie dépasse 21 mois - Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
            </span>
          </div>
        }
        <!-- Comment (mandatory when adjusted is filled) -->
        <div class="row-content">
          <mat-form-field appearance="outline" class="w-100">
            <textarea
              matInput
              [formControl]="$any(externalSponsorForm.get('adjustedSponsorTurnoverOverrideComment'))"
              [maxlength]="maxChars() ?? 200"
              [placeholder]="commentPlaceholder"
              rows="4"
            ></textarea>
          </mat-form-field>
        </div>
        @if (
          (externalSponsorForm.controls.adjustedSponsorTurnoverOverrideComment.touched || validationInProgress()) &&
          externalSponsorForm.controls.adjustedSponsorTurnoverOverrideComment.errors?.['required']
        ) {
          <div class="field-error-container">
            <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
          </div>
        }
      }
    </div>
  }

  <!-- ─── BR05: Other → Assets Under Management ───────────────────── -->
  @if (showAUMFields()) {
    <div class="row-item">
      <div class="row-label" i18n="title for assets under management label@@assetsUnderManagementLabel">
        Actifs sous gestion
      </div>
      <div class="row-content">
        <bnpp-workflow-input
          class="w-100"
          [formControl]="$any(externalSponsorForm.get('assetsUnderManagement'))"
          [formFieldLabel]="'assetsUnderManagementLabel'"
          [placeholderKey]="'assetsUnderManagementLabel'"
          [inputType]="'number'"
        ></bnpp-workflow-input>
      </div>
      @if (showAUMFields() && formValue().assetsUnderManagement !== null) {
        <!-- Unit -->
        <div class="row-content">
          <bnpp-workflow-select-list
            [placeholder]="referenceCurrencyPlaceholder"
            [itemsList]="referenceCurrencyUnitList"
            [selectControl]="$any(externalSponsorForm.get('assetsUnderManagementUnit'))"
          ></bnpp-workflow-select-list>
        </div>
        <!-- Currency -->
        <div class="row-content">
          <bnpp-workflow-autocomplete
            class="w-100"
            [placeholder]="currencyPlaceholder"
            [itemsList]="filteredCurrencyList"
            [initialValue]="assetUnderManagementCurrencyInitialValue"
            [autocompleteControl]="$any(externalSponsorForm.get('assetsUnderManagementCurrency'))"
            (inputChangedValueEvent)="onCurrencySearch($event)"
          ></bnpp-workflow-autocomplete>
        </div>
        <!-- Closing date -->
        <div class="row-content">
          <mat-form-field appearance="outline" class="w-100 date-field">
            <input
              matInput
              [matDatepicker]="aumClosingDatePicker"
              [formControl]="$any(externalSponsorForm.get('assetsUnderManagementClosingDate'))"
              class="horizontal-center"
              [placeholder]="closingDatePlaceholder"
            />
            <mat-datepicker-toggle matIconSuffix [for]="aumClosingDatePicker"></mat-datepicker-toggle>
            <mat-datepicker #aumClosingDatePicker panelClass="'customized-date-panel'"></mat-datepicker>
          </mat-form-field>
        </div>
        @if (showAUMDateWarning()) {
          <div class="field-warning-container">
            <span class="warning-text" i18n="@@closingDate21MonthsWarning">
              La date d'arrêté saisie dépasse 21 mois - Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
            </span>
          </div>
        }
      }
      @if (
        (externalSponsorForm.controls.assetsUnderManagementUnit.touched || validationInProgress()) &&
        externalSponsorForm.controls.assetsUnderManagementUnit.errors?.['required']
      ) {
        <div class="field-error-container">
          <mat-error i18n="This field is required@@requiredFieldLabel">Ce champ est obligatoire</mat-error>
        </div>
      }
    </div>
  }
}

<!-- ─── BR06: Sponsor Involvement (always shown) ──────────────────── -->
<div class="row-item">
  <div class="row-label" i18n="title for sponsor involvement@@sponsorInvolvementLabel">
    Quelle est l'implication du sponsor ?
  </div>
  <div class="row-content">
    <bnpp-workflow-selection
      class="w-100"
      [options]="sponsorInvolvementOptions"
      [selectionControl]="$any(externalSponsorForm.get('sponsorInvolvement'))"
      aria-required="true"
    ></bnpp-workflow-selection>
  </div>
  @if (
    (externalSponsorForm.controls.sponsorInvolvement.touched || validationInProgress()) &&
    externalSponsorForm.controls.sponsorInvolvement.errors?.['required']
  ) {
    <div class="field-error-container">
      <mat-error i18n="Missing mandatory item sponsor involvement@@missingSponsorInvolvementLabel">
        Item obligatoire manquant : Quelle est l'implication du Sponsor
      </mat-error>
    </div>
  }
</div>

<!-- ─── BR07: Sponsor Assessment & Involvement (auto, read-only) ──── -->
<div class="row-item">
  <div class="row-label" i18n="title for sponsor assessment and involvement@@sponsorAssessmentLabel">
    Evaluation et implication du sponsor
  </div>
  <div class="row-content">
    <span class="data-indicator">
      {{ externalSponsorForm.controls.sponsorStrength.value }}
    </span>
  </div>
</div>




      parent:

@if (!ratingForm().get('sponsorEntity.sponsorIdentifiedWithRmpmId')?.value) {
  <bnpp-external-sponsor
    [ratingForm]="ratingForm()"
    [workflowDTO]="workflowDTO()"
    [validationInProgress]="validationInProgress()"
    [maxChars]="maxChars()"
  ></bnpp-external-sponsor>
}


export type ExternalRatingSource = 'FITCH' | 'MOODYS' | 'SP';
