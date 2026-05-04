import { Component, computed, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { WorkflowDocument } from '@lazyloaded/counterparty/model/crf-workflow-document';
import {
  ISelectionOption,
  WorkflowSelectionComponent,
} from '@shared/components/workflow-selection/workflow-selection.component';
import { WorkflowInputNumberComponent } from '@shared/components/workflow-input-number/workflow-input-number.component';
import { WorkflowSelectListComponent } from '@shared/components/workflow-select-list/workflow-select-list.component';
import { WorkflowAutocompleteComponent } from '@shared/components/workflow-autocomplete/workflow-autocomplete.component';
import { MaterialModule } from '@shared/modules/MaterialModule';
import { closingDateOutdatedValidator } from '@shared/validators/closing-date-outdated.validator';

@Component({
  selector: 'bnpp-external-sponsor',
  templateUrl: './external-sponsor.component.html',
  styleUrls: ['./external-sponsor.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    WorkflowSelectionComponent,
    WorkflowInputNumberComponent,
    WorkflowSelectListComponent,
    WorkflowAutocompleteComponent,
  ],
})
export class ExternalSponsorComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  ratingForm = input.required<FormGroup>();
  workflowDTO = input.required<WorkflowDocument>();
  validationInProgress = input<boolean>();

  readonly sponsorForm = this.formBuilder.group({
    // BR01 – always shown for external sponsor
    sponsorName: this.formBuilder.control<string | null>(null, Validators.required),
    hasExternalRating: this.formBuilder.control<boolean | null>(null, Validators.required),
    commentOnExternalData: this.formBuilder.control<string | null>(null, Validators.required),

    // BR02 – when hasExternalRating = true
    externalRatingSource: this.formBuilder.control<string | null>(null),
    externalSponsorRating: this.formBuilder.control<string | null>(null),
    externalSponsorRatingDate: this.formBuilder.control<Date | null>(null),

    // BR03 – when hasExternalRating = false
    sponsorType: this.formBuilder.control<string | null>(null),

    // BR04 – when sponsorType = CORPORATE
    sponsorTurnover: this.formBuilder.control<number | null>(null),
    sponsorTurnoverUnit: this.formBuilder.control<string | null>(null),
    sponsorTurnoverCurrency: this.formBuilder.control<string | null>(null),
    sponsorTurnoverClosingDate: this.formBuilder.control<Date | null>(null),

    // BR04 – Adjusted Sponsor Turnover (non-mandatory, but triggers sub-fields)
    adjustedSponsorTurnover: this.formBuilder.control<number | null>(null),
    adjustedSponsorTurnoverUnit: this.formBuilder.control<string | null>(null),
    adjustedSponsorTurnoverCurrency: this.formBuilder.control<string | null>(null),
    adjustedSponsorTurnoverClosingDate: this.formBuilder.control<Date | null>(null),
    adjustedComment: this.formBuilder.control<string | null>(null),

    // BR05 – when sponsorType = OTHER
    assetsUnderManagement: this.formBuilder.control<number | null>(null),
    assetsUnderManagementUnit: this.formBuilder.control<string | null>(null),
    assetsUnderManagementCurrency: this.formBuilder.control<string | null>(null),
    assetsUnderManagementClosingDate: this.formBuilder.control<Date | null>(null),

    // BR06 – always shown
    sponsorInvolvement: this.formBuilder.control<string[] | null>(null, Validators.required),
  });

  private previousFormValue = this.sponsorForm.getRawValue();
  private isResettingDescendants = false;

  // Order matters: cascade reset clears everything after the first changed control
  private readonly controlFlow = [
    'sponsorName',
    'hasExternalRating',
    'commentOnExternalData',
    'externalRatingSource',
    'externalSponsorRating',
    'externalSponsorRatingDate',
    'sponsorType',
    'sponsorTurnover',
    'sponsorTurnoverUnit',
    'sponsorTurnoverCurrency',
    'sponsorTurnoverClosingDate',
    'adjustedSponsorTurnover',
    'adjustedSponsorTurnoverUnit',
    'adjustedSponsorTurnoverCurrency',
    'adjustedSponsorTurnoverClosingDate',
    'adjustedComment',
    'assetsUnderManagement',
    'assetsUnderManagementUnit',
    'assetsUnderManagementCurrency',
    'assetsUnderManagementClosingDate',
    'sponsorInvolvement',
  ] as const;

  readonly formValue = toSignal(
    this.sponsorForm.valueChanges.pipe(startWith(this.sponsorForm.getRawValue())),
    { initialValue: this.sponsorForm.getRawValue() },
  );

  // ── Computed show/hide ────────────────────────────────────────────────────

  readonly showExternalRatingFields = computed(
    () => this.formValue().hasExternalRating === true,
  );

  readonly showSponsorType = computed(
    () => this.formValue().hasExternalRating === false,
  );

  readonly showCorporateFields = computed(
    () => this.showSponsorType() && this.formValue().sponsorType === 'CORPORATE',
  );

  readonly showOtherFields = computed(
    () => this.showSponsorType() && this.formValue().sponsorType === 'OTHER',
  );

  // ── Options ───────────────────────────────────────────────────────────────

  readonly yesNoOptions: ISelectionOption[] = [
    { label: $localize`:common true response@@CommonTrue:Oui`, value: true, iconName: 'check' },
    { label: $localize`:common false response@@CommonFalse:Non`, value: false, iconName: 'close' },
  ];

  readonly externalRatingSourceOptions: ISelectionOption[] = [
    { label: 'Fitch', value: 'FITCH' },
    { label: "Moody's", value: 'MOODYS' },
    { label: 'S&P', value: 'SP' },
  ];

  readonly sponsorTypeOptions: ISelectionOption[] = [
    { label: $localize`:@@corporateLabel:Corporate`, value: 'CORPORATE' },
    { label: $localize`:@@otherLabel:Other`, value: 'OTHER' },
  ];

  readonly sponsorInvolvementOptions: ISelectionOption[] = [
    {
      label: $localize`:@@completionGuarantorLabel:Completion Guarantor`,
      value: 'COMPLETION_GUARANTOR',
    },
    { label: $localize`:@@offtakerLabel:Offtaker`, value: 'OFFTAKER' },
    { label: $localize`:@@epcContractorLabel:EPC Contractor`, value: 'EPC_CONTRACTOR' },
    { label: $localize`:@@operatorLabel:Operator`, value: 'OPERATOR' },
    {
      label: $localize`:@@otherOperationalInvolvementLabel:Other Type of operational involvement`,
      value: 'OTHER_OPERATIONAL',
    },
  ];

  private readonly fitchRatingOptions: ISelectionOption[] = [
    'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-',
    'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-',
    'B+', 'B', 'B-', 'CCC', 'CC', 'C', 'D',
  ].map(v => ({ label: v, value: v }));

  private readonly moodysRatingOptions: ISelectionOption[] = [
    'Aaa', 'Aa1', 'Aa2', 'Aa3', 'A1', 'A2', 'A3',
    'Baa1', 'Baa2', 'Baa3', 'Ba1', 'Ba2', 'Ba3',
    'B1', 'B2', 'B3', 'Caa1', 'Caa2', 'Caa3', 'Ca', 'C',
  ].map(v => ({ label: v, value: v }));

  private readonly spRatingOptions: ISelectionOption[] = [
    'AAA', 'AA+', 'AA', 'AA-', 'A+', 'A', 'A-',
    'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'BB-',
    'B+', 'B', 'B-', 'CCC+', 'CCC', 'CCC-', 'CC', 'C', 'D',
  ].map(v => ({ label: v, value: v }));

  readonly currentRatingOptions = computed<ISelectionOption[]>(() => {
    switch (this.formValue().externalRatingSource) {
      case 'FITCH':  return this.fitchRatingOptions;
      case 'MOODYS': return this.moodysRatingOptions;
      case 'SP':     return this.spRatingOptions;
      default:       return [];
    }
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.initFormValues();
    this.registerFormInParent();
    this.initPreviousFormValue();
    this.setupDependentControlReset();
    this.updateDynamicValidatorsAndResets();
  }

  // ── Initialisation ────────────────────────────────────────────────────────

  private initFormValues(): void {
    const sponsorInfo = this.workflowDTO().counterPartyRating?.sponsorInfo;
    if (!sponsorInfo) return;
    this.sponsorForm.patchValue({
      sponsorName: sponsorInfo.sponsorName,
      hasExternalRating: sponsorInfo.hasExternalRating,
      commentOnExternalData: sponsorInfo.commentOnExternalData,
      externalRatingSource: sponsorInfo.externalRatingSource,
      externalSponsorRating: sponsorInfo.externalSponsorRating,
      externalSponsorRatingDate: sponsorInfo.externalSponsorRatingDate,
      sponsorType: sponsorInfo.sponsorType,
      sponsorTurnover: sponsorInfo.sponsorTurnover,
      sponsorTurnoverUnit: sponsorInfo.sponsorTurnoverUnit,
      sponsorTurnoverCurrency: sponsorInfo.sponsorTurnoverCurrency,
      sponsorTurnoverClosingDate: sponsorInfo.sponsorTurnoverClosingDate,
      adjustedSponsorTurnover: sponsorInfo.adjustedSponsorTurnover,
      adjustedSponsorTurnoverUnit: sponsorInfo.adjustedSponsorTurnoverUnit,
      adjustedSponsorTurnoverCurrency: sponsorInfo.adjustedSponsorTurnoverCurrency,
      adjustedSponsorTurnoverClosingDate: sponsorInfo.adjustedSponsorTurnoverClosingDate,
      adjustedComment: sponsorInfo.adjustedComment,
      assetsUnderManagement: sponsorInfo.assetsUnderManagement,
      assetsUnderManagementUnit: sponsorInfo.assetsUnderManagementUnit,
      assetsUnderManagementCurrency: sponsorInfo.assetsUnderManagementCurrency,
      assetsUnderManagementClosingDate: sponsorInfo.assetsUnderManagementClosingDate,
      sponsorInvolvement: sponsorInfo.sponsorInvolvement,
    });
  }

  private registerFormInParent(): void {
    this.ratingForm().setControl('sponsor', this.sponsorForm);
  }

  private initPreviousFormValue(): void {
    this.previousFormValue = this.sponsorForm.getRawValue();
  }

  // ── Reactive cascade reset ────────────────────────────────────────────────

  private setupDependentControlReset(): void {
    this.sponsorForm.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(currentValue => {
        if (this.isResettingDescendants) {
          this.previousFormValue = this.sponsorForm.getRawValue();
          this.updateDynamicValidatorsAndResets();
          return;
        }
        this.isResettingDescendants = true;
        this.clearDescendantsFromFirstChangedControl(this.previousFormValue, currentValue);
        this.isResettingDescendants = false;
        this.updateDynamicValidatorsAndResets();
        this.previousFormValue = this.sponsorForm.getRawValue();
      });
  }

  // ── Dynamic validators & resets ───────────────────────────────────────────

  updateDynamicValidatorsAndResets(): void {
    const fv = this.sponsorForm.getRawValue();
    const c = this.sponsorForm.controls;

    const hasRating   = fv.hasExternalRating === true;
    const noRating    = fv.hasExternalRating === false;
    const isCorporate = fv.sponsorType === 'CORPORATE';
    const isOther     = fv.sponsorType === 'OTHER';
    const showCorp    = noRating && isCorporate;
    const showOther   = noRating && isOther;

    // BR02 – external rating fields
    this.setRequired(c.externalRatingSource, hasRating);
    this.resetIfHidden(c.externalRatingSource, hasRating);
    this.setRequired(c.externalSponsorRating, hasRating);
    this.resetIfHidden(c.externalSponsorRating, hasRating);
    this.setRequired(c.externalSponsorRatingDate, hasRating);
    this.resetIfHidden(c.externalSponsorRatingDate, hasRating);

    // BR03 – sponsor type chip
    this.setRequired(c.sponsorType, noRating);
    this.resetIfHidden(c.sponsorType, noRating);

    // BR04 – corporate fields
    this.resetIfHidden(c.sponsorTurnover, showCorp);
    const hasTurnover = showCorp && this.hasValue(fv.sponsorTurnover);
    this.setRequired(c.sponsorTurnoverUnit, hasTurnover);
    this.resetIfHidden(c.sponsorTurnoverUnit, showCorp);
    this.setRequired(c.sponsorTurnoverCurrency, hasTurnover);
    this.resetIfHidden(c.sponsorTurnoverCurrency, showCorp);
    this.setRequired(c.sponsorTurnoverClosingDate, hasTurnover);
    this.resetIfHidden(c.sponsorTurnoverClosingDate, showCorp);

    // BR04 – adjusted turnover sub-fields become mandatory only when adjusted is filled
    this.resetIfHidden(c.adjustedSponsorTurnover, showCorp);
    const hasAdjusted = showCorp && this.hasValue(fv.adjustedSponsorTurnover);
    this.setRequired(c.adjustedSponsorTurnoverUnit, hasAdjusted);
    this.resetIfHidden(c.adjustedSponsorTurnoverUnit, showCorp);
    this.setRequired(c.adjustedSponsorTurnoverCurrency, hasAdjusted);
    this.resetIfHidden(c.adjustedSponsorTurnoverCurrency, showCorp);
    this.setRequired(c.adjustedSponsorTurnoverClosingDate, hasAdjusted);
    this.resetIfHidden(c.adjustedSponsorTurnoverClosingDate, showCorp);
    this.setRequired(c.adjustedComment, hasAdjusted);
    this.resetIfHidden(c.adjustedComment, showCorp);

    // BR05 – AUM fields
    this.resetIfHidden(c.assetsUnderManagement, showOther);
    const hasAum = showOther && this.hasValue(fv.assetsUnderManagement);
    this.setRequired(c.assetsUnderManagementUnit, hasAum);
    this.resetIfHidden(c.assetsUnderManagementUnit, showOther);
    this.setRequired(c.assetsUnderManagementCurrency, hasAum);
    this.resetIfHidden(c.assetsUnderManagementCurrency, showOther);
    this.setRequired(c.assetsUnderManagementClosingDate, hasAum);
    this.resetIfHidden(c.assetsUnderManagementClosingDate, showOther);

    // 21-month warning validator on closing dates (non-blocking)
    this.applyOutdatedDateValidator(c.sponsorTurnoverClosingDate);
    this.applyOutdatedDateValidator(c.adjustedSponsorTurnoverClosingDate);
    this.applyOutdatedDateValidator(c.assetsUnderManagementClosingDate);
    this.applyOutdatedDateValidator(c.externalSponsorRatingDate, 12);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private setRequired(ctrl: FormControl, required: boolean): void {
    if (required) ctrl.addValidators(Validators.required);
    else ctrl.removeValidators(Validators.required);
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private resetIfHidden(ctrl: FormControl, visible: boolean): void {
    if (visible) return;
    ctrl.setValue(null, { emitEvent: false });
    ctrl.clearValidators();
    ctrl.markAsPristine();
    ctrl.markAsUntouched();
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private clearControl(ctrl: FormControl): void {
    ctrl.setValue(null);
    ctrl.markAsPristine();
    ctrl.markAsUntouched();
  }

  private clearDescendantsFromFirstChangedControl(previous: any, current: any): void {
    const changedIndex = this.controlFlow.findIndex(
      name => previous?.[name] !== current?.[name],
    );
    if (changedIndex === -1) return;
    this.controlFlow.slice(changedIndex + 1).forEach(name =>
      this.clearControl(this.sponsorForm.controls[name] as FormControl),
    );
  }

  private applyOutdatedDateValidator(ctrl: FormControl, months = 21): void {
    ctrl.removeValidators(closingDateOutdatedValidator(months));
    if (ctrl.value) ctrl.addValidators(closingDateOutdatedValidator(months));
    ctrl.updateValueAndValidity({ emitEvent: false });
  }

  private hasValue(v: unknown): boolean {
    return v !== null && v !== undefined && v !== '';
  }
}




<mat-accordion class="accordion-container" multi hideToggle>
  <mat-expansion-panel class="crf-expansion-panel" #panel [expanded]="true">
    <div class="crf-mat-expansion-content">
      <mat-card class="crf-mat-expansion-content-card">
        <mat-card-content>

          <!-- ── Sponsor Name ─────────────────────────────────────────── -->
          <div class="row-item">
            <div class="row-label" i18n="@@sponsorNameLabel">Nom du sponsor</div>
            <div class="row-content">
              <mat-form-field appearance="outline" class="w-100">
                <input
                  matInput
                  [formControl]="sponsorForm.controls.sponsorName"
                  placeholder="Nom du sponsor"
                  i18n-placeholder="@@sponsorNameLabel"
                  aria-required="true"
                />
              </mat-form-field>
            </div>
          </div>
          @if (
            (sponsorForm.controls.sponsorName.touched || validationInProgress()) &&
            sponsorForm.controls.sponsorName.errors?.['required']
          ) {
            <div class="field-error-container">
              <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
            </div>
          }

          <!-- ── Has External Rating ──────────────────────────────────── -->
          <div class="row-item">
            <div class="row-label" i18n="@@hasExternalRatingLabel">Le sponsor a-t-il une notation externe ?</div>
            <div class="row-content">
              <bnpp-workflow-selection
                class="w-100"
                [options]="yesNoOptions"
                [selectionControl]="sponsorForm.controls.hasExternalRating"
                aria-required="true"
              ></bnpp-workflow-selection>
            </div>
          </div>
          @if (
            (sponsorForm.controls.hasExternalRating.touched || validationInProgress()) &&
            sponsorForm.controls.hasExternalRating.errors?.['required']
          ) {
            <div class="field-error-container">
              <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
            </div>
          }

          <!-- ── BR02 – External Rating Fields ───────────────────────── -->
          @if (showExternalRatingFields()) {

            <!-- External Rating Source -->
            <div class="row-item">
              <div class="row-label" i18n="@@externalRatingSourceLabel">Source de la notation externe</div>
              <div class="row-content">
                <bnpp-workflow-selection
                  class="w-100"
                  [options]="externalRatingSourceOptions"
                  [selectionControl]="sponsorForm.controls.externalRatingSource"
                  aria-required="true"
                ></bnpp-workflow-selection>
              </div>
            </div>
            @if (
              (sponsorForm.controls.externalRatingSource.touched || validationInProgress()) &&
              sponsorForm.controls.externalRatingSource.errors?.['required']
            ) {
              <div class="field-error-container">
                <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
              </div>
            }

            <!-- External Sponsor Rating + Date (same row per spec) -->
            <div class="row-item">
              <div class="row-label" i18n="@@externalSponsorRatingLabel">Notation sponsor externe</div>
              <div class="row-content">
                <bnpp-workflow-select-list
                  class="w-100"
                  [itemsList]="currentRatingOptions()"
                  [selectControl]="$any(sponsorForm.get('externalSponsorRating'))"
                  [colorTheme]="'RATING_THEME'"
                  aria-required="true"
                ></bnpp-workflow-select-list>
              </div>
              <div class="row-label" i18n="@@externalRatingDateLabel">Date notation sponsor externe</div>
              <div class="row-content">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="externalRatingDatePicker"
                    [formControl]="sponsorForm.controls.externalSponsorRatingDate"
                    placeholder="dd/mm/yyyy"
                    i18n-placeholder="@@externalRatingDateLabel"
                    aria-required="true"
                  />
                  <mat-datepicker-toggle matIconSuffix [for]="externalRatingDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #externalRatingDatePicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
            @if (
              (sponsorForm.controls.externalSponsorRating.touched || validationInProgress()) &&
              sponsorForm.controls.externalSponsorRating.errors?.['required']
            ) {
              <div class="field-error-container">
                <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
              </div>
            }
            @if (
              (sponsorForm.controls.externalSponsorRatingDate.touched || validationInProgress()) &&
              sponsorForm.controls.externalSponsorRatingDate.errors?.['required']
            ) {
              <div class="field-error-container">
                <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
              </div>
            }
            @if (
              (sponsorForm.controls.externalSponsorRatingDate.touched || validationInProgress()) &&
              sponsorForm.controls.externalSponsorRatingDate.errors?.['closingDate12Months']
            ) {
              <div class="field-error-container" i18n="@@closingDateOutdatedWarningLabel">
                La date d'arrêté saisie dépasse 12 mois – Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
              </div>
            }

          }

          <!-- ── Comment on External Data (always shown) ─────────────── -->
          <div class="row-item">
            <div class="row-label" i18n="@@commentOnExternalDataLabel">Commentaire en cas de données externes</div>
            <div class="row-content">
              <mat-form-field appearance="outline" class="w-100">
                <textarea
                  matInput
                  [formControl]="sponsorForm.controls.commentOnExternalData"
                  rows="4"
                  aria-required="true"
                ></textarea>
              </mat-form-field>
            </div>
          </div>
          @if (
            (sponsorForm.controls.commentOnExternalData.touched || validationInProgress()) &&
            sponsorForm.controls.commentOnExternalData.errors?.['required']
          ) {
            <div class="field-error-container">
              <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
            </div>
          }

          <!-- ── BR03 – Sponsor Type ──────────────────────────────────── -->
          @if (showSponsorType()) {
            <div class="row-item">
              <div class="row-label" i18n="@@sponsorTypeLabel">Type de sponsor</div>
              <div class="row-content">
                <bnpp-workflow-selection
                  class="w-100"
                  [options]="sponsorTypeOptions"
                  [selectionControl]="sponsorForm.controls.sponsorType"
                  aria-required="true"
                ></bnpp-workflow-selection>
              </div>
            </div>
            @if (
              (sponsorForm.controls.sponsorType.touched || validationInProgress()) &&
              sponsorForm.controls.sponsorType.errors?.['required']
            ) {
              <div class="field-error-container">
                <mat-error i18n="@@sponsorTypeMissingErrorLabel">
                  Le sponsor ne dispose d'aucune notation disponible ou valide, veuillez sélectionner le type de sponsor pour poursuivre l'évaluation de sa solidité.
                </mat-error>
              </div>
            }
          }

          <!-- ── BR04 – Corporate: Sponsor Turnover ──────────────────── -->
          @if (showCorporateFields()) {

            <!-- Sponsor Turnover (Sales) + Unit + Currency -->
            <div class="row-item">
              <div class="row-label" i18n="@@sponsorTurnoverLabel">Le chiffre d'affaires du sponsor</div>
              <div class="row-content">
                <bnpp-workflow-input-number
                  class="w-100"
                  [control]="$any(sponsorForm.get('sponsorTurnover'))"
                  [formFieldLabel]="'sponsorTurnoverPlaceholder'"
                  [placeholderKey]="'sponsorTurnoverPlaceholder'"
                ></bnpp-workflow-input-number>
              </div>
              <div class="row-content">
                <div class="field-wrapper">
                  <div class="reference-currency-column">
                    <div class="reference-currency-row">
                      <div class="reference-currency-item">
                        <bnpp-workflow-select-list
                          [placeholder]="'Unit'"
                          [itemsList]="unitOptions"
                          [selectControl]="$any(sponsorForm.get('sponsorTurnoverUnit'))"
                          [colorTheme]="'RATING_THEME'"
                        ></bnpp-workflow-select-list>
                      </div>
                    </div>
                  </div>
                  @if (
                    (sponsorForm.controls.sponsorTurnoverUnit.touched || validationInProgress()) &&
                    sponsorForm.controls.sponsorTurnoverUnit.errors?.['required']
                  ) {
                    <div class="field-error-message" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
                  }
                </div>
              </div>
              <div class="row-content">
                <div class="field-wrapper">
                  <bnpp-workflow-autocomplete
                    [placeholder]="'Devise'"
                    [itemsList]="filteredCurrencyList()"
                    [autocompleteControl]="$any(sponsorForm.get('sponsorTurnoverCurrency'))"
                    (inputChangedValueEvent)="onSearchCurrencies($event)"
                    [colorTheme]="'RATING_THEME'"
                  ></bnpp-workflow-autocomplete>
                  @if (
                    (sponsorForm.controls.sponsorTurnoverCurrency.touched || validationInProgress()) &&
                    sponsorForm.controls.sponsorTurnoverCurrency.errors?.['required']
                  ) {
                    <div class="field-error-message" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
                  }
                </div>
              </div>
            </div>

            <!-- Sponsor Turnover Closing Date -->
            <div class="row-item fade-in">
              <div class="row-label" i18n="@@closingDateLabel">Date d'arrêté</div>
              <div class="row-content">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="turnoverClosingDatePicker"
                    [formControl]="sponsorForm.controls.sponsorTurnoverClosingDate"
                    placeholder="dd/mm/yyyy"
                    i18n-placeholder="@@closingDateLabel"
                    aria-required="true"
                  />
                  <mat-datepicker-toggle matIconSuffix [for]="turnoverClosingDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #turnoverClosingDatePicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
            @if (
              (sponsorForm.controls.sponsorTurnoverClosingDate.touched || validationInProgress()) &&
              sponsorForm.controls.sponsorTurnoverClosingDate.errors?.['required']
            ) {
              <div class="field-error-container">
                <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
              </div>
            }
            @if (
              (sponsorForm.controls.sponsorTurnoverClosingDate.touched || validationInProgress()) &&
              sponsorForm.controls.sponsorTurnoverClosingDate.errors?.['closingDate21Months']
            ) {
              <div class="field-error-container" i18n="@@closingDateOutdated21MonthsWarningLabel">
                La date d'arrêté saisie dépasse 21 mois – Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
              </div>
            }

            <!-- ── Adjusted Sponsor Turnover (non-mandatory) ─────────── -->
            <div class="row-item fade-in">
              <div class="row-label" i18n="@@adjustedSponsorTurnoverLabel">Le chiffre d'affaires ajusté du sponsor</div>
              <div class="row-content">
                <bnpp-workflow-input-number
                  class="w-100"
                  [control]="$any(sponsorForm.get('adjustedSponsorTurnover'))"
                  [formFieldLabel]="'adjustedSponsorTurnoverPlaceholder'"
                  [placeholderKey]="'adjustedSponsorTurnoverPlaceholder'"
                ></bnpp-workflow-input-number>
              </div>
              <div class="row-content">
                <div class="field-wrapper">
                  <bnpp-workflow-select-list
                    [itemsList]="unitOptions"
                    [selectControl]="$any(sponsorForm.get('adjustedSponsorTurnoverUnit'))"
                    [colorTheme]="'RATING_THEME'"
                  ></bnpp-workflow-select-list>
                  @if (
                    (sponsorForm.controls.adjustedSponsorTurnoverUnit.touched || validationInProgress()) &&
                    sponsorForm.controls.adjustedSponsorTurnoverUnit.errors?.['required']
                  ) {
                    <div class="field-error-message" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
                  }
                </div>
              </div>
              <div class="row-content">
                <div class="field-wrapper">
                  <bnpp-workflow-autocomplete
                    [itemsList]="filteredCurrencyList()"
                    [autocompleteControl]="$any(sponsorForm.get('adjustedSponsorTurnoverCurrency'))"
                    (inputChangedValueEvent)="onSearchCurrencies($event)"
                    [colorTheme]="'RATING_THEME'"
                  ></bnpp-workflow-autocomplete>
                  @if (
                    (sponsorForm.controls.adjustedSponsorTurnoverCurrency.touched || validationInProgress()) &&
                    sponsorForm.controls.adjustedSponsorTurnoverCurrency.errors?.['required']
                  ) {
                    <div class="field-error-message" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
                  }
                </div>
              </div>
              <div class="row-content">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="adjustedClosingDatePicker"
                    [formControl]="sponsorForm.controls.adjustedSponsorTurnoverClosingDate"
                    placeholder="dd/mm/yyyy"
                    i18n-placeholder="@@closingDateLabel"
                  />
                  <mat-datepicker-toggle matIconSuffix [for]="adjustedClosingDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #adjustedClosingDatePicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
            @if (
              (sponsorForm.controls.adjustedSponsorTurnoverClosingDate.touched || validationInProgress()) &&
              sponsorForm.controls.adjustedSponsorTurnoverClosingDate.errors?.['closingDate21Months']
            ) {
              <div class="field-error-container" i18n="@@closingDateOutdated21MonthsWarningLabel">
                La date d'arrêté saisie dépasse 21 mois – Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
              </div>
            }

            <!-- Adjusted Comment (mandatory when adjustedSponsorTurnover filled) -->
            <div class="row-item fade-in">
              <div class="row-label" i18n="@@adjustedCommentLabel">Commentaire</div>
              <div class="row-content">
                <mat-form-field appearance="outline" class="w-100">
                  <textarea
                    matInput
                    [formControl]="sponsorForm.controls.adjustedComment"
                    placeholder="Justifier la modification du chiffre d'affaires du sponsor"
                    i18n-placeholder="@@adjustedCommentPlaceholder"
                    rows="4"
                  ></textarea>
                </mat-form-field>
              </div>
            </div>
            @if (
              (sponsorForm.controls.adjustedComment.touched || validationInProgress()) &&
              sponsorForm.controls.adjustedComment.errors?.['required']
            ) {
              <div class="field-error-container">
                <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
              </div>
            }

          }

          <!-- ── BR05 – Other: Assets Under Management ────────────────── -->
          @if (showOtherFields()) {

            <div class="row-item fade-in">
              <div class="row-label" i18n="@@assetsUnderManagementLabel">Actifs sous gestion</div>
              <div class="row-content">
                <bnpp-workflow-input-number
                  class="w-100"
                  [control]="$any(sponsorForm.get('assetsUnderManagement'))"
                  [formFieldLabel]="'assetsUnderManagementPlaceholder'"
                  [placeholderKey]="'assetsUnderManagementPlaceholder'"
                ></bnpp-workflow-input-number>
              </div>
              <div class="row-content">
                <div class="field-wrapper">
                  <bnpp-workflow-select-list
                    [itemsList]="unitOptions"
                    [selectControl]="$any(sponsorForm.get('assetsUnderManagementUnit'))"
                    [colorTheme]="'RATING_THEME'"
                  ></bnpp-workflow-select-list>
                  @if (
                    (sponsorForm.controls.assetsUnderManagementUnit.touched || validationInProgress()) &&
                    sponsorForm.controls.assetsUnderManagementUnit.errors?.['required']
                  ) {
                    <div class="field-error-message" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
                  }
                </div>
              </div>
              <div class="row-content">
                <div class="field-wrapper">
                  <bnpp-workflow-autocomplete
                    [itemsList]="filteredCurrencyList()"
                    [autocompleteControl]="$any(sponsorForm.get('assetsUnderManagementCurrency'))"
                    (inputChangedValueEvent)="onSearchCurrencies($event)"
                    [colorTheme]="'RATING_THEME'"
                  ></bnpp-workflow-autocomplete>
                  @if (
                    (sponsorForm.controls.assetsUnderManagementCurrency.touched || validationInProgress()) &&
                    sponsorForm.controls.assetsUnderManagementCurrency.errors?.['required']
                  ) {
                    <div class="field-error-message" i18n="@@requiredFieldLabel">Ce champ est obligatoire</div>
                  }
                </div>
              </div>
              <!-- AUM Closing Date on the same row per spec -->
              <div class="row-content">
                <mat-form-field appearance="outline" class="w-100 date-field">
                  <input
                    matInput
                    [matDatepicker]="aumClosingDatePicker"
                    [formControl]="sponsorForm.controls.assetsUnderManagementClosingDate"
                    placeholder="dd/mm/yyyy"
                    i18n-placeholder="@@closingDateLabel"
                  />
                  <mat-datepicker-toggle matIconSuffix [for]="aumClosingDatePicker"></mat-datepicker-toggle>
                  <mat-datepicker #aumClosingDatePicker></mat-datepicker>
                </mat-form-field>
              </div>
            </div>
            @if (
              (sponsorForm.controls.assetsUnderManagementClosingDate.touched || validationInProgress()) &&
              sponsorForm.controls.assetsUnderManagementClosingDate.errors?.['closingDate21Months']
            ) {
              <div class="field-error-container" i18n="@@closingDateOutdated21MonthsWarningLabel">
                La date d'arrêté saisie dépasse 21 mois – Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.
              </div>
            }

          }

          <!-- ── BR06 – Sponsor Involvement (always shown) ───────────── -->
          <div class="row-item">
            <div class="row-label" i18n="@@sponsorInvolvementLabel">Quelle est l'implication du sponsor ?</div>
            <div class="row-content">
              <bnpp-workflow-selection
                class="w-100"
                [options]="sponsorInvolvementOptions"
                [selectionControl]="sponsorForm.controls.sponsorInvolvement"
                [multiple]="true"
                aria-required="true"
              ></bnpp-workflow-selection>
            </div>
          </div>
          @if (
            (sponsorForm.controls.sponsorInvolvement.touched || validationInProgress()) &&
            sponsorForm.controls.sponsorInvolvement.errors?.['required']
          ) {
            <div class="field-error-container">
              <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
            </div>
          }

          <!-- ── BR07 – Sponsor Assessment & Involvement (read-only) ─── -->
          <div class="row-item">
            <div class="row-label" i18n="@@sponsorAssessmentAndInvolvementLabel">Évaluation et implication du sponsor</div>
            <div class="row-content">
              <div class="data-container readonly-meta-container">
                <span class="data-text text-capitalize data-indicator">
                  {{ workflowDTO().counterPartyRating?.sponsorInfo?.sponsorAssessmentAndInvolvement }}
                </span>
              </div>
            </div>
          </div>

        </mat-card-content>
      </mat-card>
    </div>
  </mat-expansion-panel>
</mat-accordion>
