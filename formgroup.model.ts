currentCounterpartyRating: [],
archivedCounterpartyRating: [],
adjustedCounterpartyRating: [],
archivedSuGrrPercentage: [],
adjustedSuGrrPercentage: [],
adjustedDataComment: [null, Validators.maxLength(this.maxChars())],

  currentCounterpartyRating: formValues['borrower'].currentCounterpartyRating,
archivedCounterpartyRating: formValues['borrower'].archivedCounterpartyRating,
adjustedCounterpartyRating: formValues['borrower'].adjustedCounterpartyRating,
archivedSuGrrPercentage: formValues['borrower'].archivedSuGrrPercentage,
adjustedSuGrrPercentage: formValues['borrower'].adjustedSuGrrPercentage,
adjustedDataComment: formValues['borrower'].adjustedDataComment,



  archivedCounterpartyRating?: string | null;
adjustedCounterpartyRating?: string | null;
archivedSuGrrPercentage?: number | null;
adjustedSuGrrPercentage?: number | null;
adjustedDataComment?: string | null;


isPgnnr = input<boolean>(false);


readonly MODEL_PGNNR = 'PGNNR';
readonly PGNNR_GRR_RATING_POLICY = 'GLOBAL NON RETAIL RATING POLICY';
private readonly EXCLUDED_RATINGS = new Set(['11.out', '12.out', '11.défaut']);
languageService = inject(LanguageService);
masterScaleOptions: IItemList[] = [];
masterscalePlaceholder = $localize`:@@selectValueLabel:`;
adjustedCommentPlaceholder = $localize`:@@pgnnrAdjustedCommentPlaceholder:Ajoutez un commentaire pour justifier la mise à jour`;
allCopied = signal(false);
private pgnnrRulesSub?: Subscription;

get copyAllRemoveAllButtonLabel(): string {
  return this.allCopied() ? $localize`:@@removeAllLabel:` : $localize`:@@copyAllLabel:`;
}
private get borrower() {
  return this.facilityGrrForm().get('borrower');
}

if (changes['isPgnnr'] && !changes['isPgnnr'].firstChange) {
  this.getModelUsed();
}
if (changes['selectedFacilityItem']?.currentValue && this.modelUsed === this.MODEL_PGNNR) {
  this.updatePgnnrValidators();
  this.syncAllCopied();
}

this.getModelUsed();
if (this.modelUsed !== this.MODEL_PGNNR) {
  this.fetchSalesForRmpmId(this.rmpmId());
  this.loadCurrentRatingApproved(this.rmpmId());
}
...
if (this.modelUsed !== this.MODEL_PGNNR) {
  this.facilitiesService.getSugrrDriverRatingArchivedData(...).subscribe(...);
}


} else {
  if (this.isPgnnr()) {
    this.modelUsed = this.MODEL_PGNNR;
    this.specificRatingPolicy = 'PGNNR'; // TODO: SRP courant, sinon dernier SRP archivé
    this.defaultGrrRatingPolicy = this.PGNNR_GRR_RATING_POLICY;
    this.facilityGrrForm().get('borrower.grrRatingPolicy')?.patchValue(this.PGNNR_GRR_RATING_POLICY);
    this.applyPgnnrBorrowerRules();
  } else if (this.isProjectFinance()) {
    this.clearPgnnrRules();
    // ... code existant inchangé
  } else {
    this.clearPgnnrRules();
    // ... code PD LC existant inchangé
  }
}

if (this.modelUsed !== 'PD Project Finance' && this.modelUsed !== this.MODEL_PGNNR) {





if (this.modelUsed === this.MODEL_PGNNR) {
  this.loadPgnnrArchivedData(entity.value);
}





// ---------- PGNNR ----------
private applyPgnnrBorrowerRules(): void {
  // Vider les champs PD LC / Asset finance cachés en PGNNR
  [...this.nonPfBorrowerFields, 'country', 'industry'].forEach(name => {
    const ctrl = this.borrower.get(name);
    ctrl?.clearValidators();
    ctrl?.updateValueAndValidity({ emitEvent: false });
  });
  this.nonPfBorrowerFields.forEach(name =>
    this.borrower.get(name)?.reset(null, { emitEvent: false }));

  if (!this.masterScaleOptions.length) this.loadMasterScaleOptions();
  this.loadPgnnrArchivedData(this.rmpmId());

  this.pgnnrRulesSub?.unsubscribe();
  this.pgnnrRulesSub = merge(
    this.borrower.get('adjustedCounterpartyRating').valueChanges,
    this.borrower.get('adjustedSuGrrPercentage').valueChanges,
  ).pipe(takeUntilDestroyed(this.destroyRef))
   .subscribe(() => this.updatePgnnrValidators());
  this.updatePgnnrValidators();
}

private clearPgnnrRules(): void {
  this.pgnnrRulesSub?.unsubscribe();
  ['adjustedCounterpartyRating', 'adjustedSuGrrPercentage'].forEach(name => {
    const ctrl = this.borrower.get(name);
    ctrl?.clearValidators();
    ctrl?.updateValueAndValidity({ emitEvent: false });
  });
  const comment = this.borrower.get('adjustedDataComment');
  comment?.setValidators(Validators.maxLength(this.maxChars()));
  comment?.updateValueAndValidity({ emitEvent: false });
}

private loadMasterScaleOptions(): void {
  this.workflowService.getMasterScaleRatingList()
    .pipe(
      takeUntilDestroyed(this.destroyRef),
      map(list => {
        const lang = this.languageService.getCurrentLang();
        return list
          .map(e => {
            const v = lang === 'en' ? e.internalRatingENValue : e.internalRatingFRValue;
            return { value: v, label: v };
          })
          .filter(o => !this.EXCLUDED_RATINGS.has(o.value.toLowerCase()));
      }),
    )
    .subscribe(options => (this.masterScaleOptions = options));
}

private loadPgnnrArchivedData(rmpmId: string): void {
  // Dernière note approuvée : on réutilise l'appel existant avec la policy PGNNR
  this.facilitiesService.getCurrentCounterpartyRatingByPolicy(rmpmId, this.specificRatingPolicy)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe(rating => {
      this.borrower.get('archivedCounterpartyRating').setValue(rating ?? null, { emitEvent: false });
      this.updatePgnnrValidators();
    });
  // TODO: endpoint du dernier SU GRR approuvé
  // this.facilitiesService.getLastApprovedSuGrr(rmpmId).subscribe(su => {
  //   this.borrower.get('archivedSuGrrPercentage').setValue(su ?? null, { emitEvent: false });
  //   this.updatePgnnrValidators();
  // });
}

updatePgnnrValidators(): void {
  const cr = this.borrower.get('adjustedCounterpartyRating');
  const su = this.borrower.get('adjustedSuGrrPercentage');
  const comment = this.borrower.get('adjustedDataComment');
  const archivedCr = this.borrower.get('archivedCounterpartyRating').value;
  const archivedSu = this.borrower.get('archivedSuGrrPercentage').value;

  cr.setValidators(archivedCr ? null : Validators.required);         // BR07
  su.setValidators(archivedSu != null ? null : Validators.required); // BR08
  comment.setValidators(this.hasPgnnrOverride()                      // BR09
    ? [Validators.required, Validators.maxLength(this.maxChars())]
    : [Validators.maxLength(this.maxChars())]);
  [cr, su, comment].forEach(c => c.updateValueAndValidity({ emitEvent: false }));
}

hasPgnnrOverride(): boolean {
  const b = this.borrower.getRawValue();
  const crOverride = b.adjustedCounterpartyRating != null &&
    b.adjustedCounterpartyRating?.toLocaleUpperCase() !== b.archivedCounterpartyRating?.toLocaleUpperCase();
  const suOverride = b.adjustedSuGrrPercentage != null &&
    b.adjustedSuGrrPercentage !== b.archivedSuGrrPercentage;
  return crOverride || suOverride;
}

copyCounterpartyRating(forceOverwrite = false): void {
  const ctrl = this.borrower.get('adjustedCounterpartyRating');
  const archived = this.borrower.get('archivedCounterpartyRating').value;
  if (forceOverwrite || ctrl.value?.toLocaleUpperCase() !== archived?.toLocaleUpperCase()) {
    ctrl.setValue(archived);
  } else {
    ctrl.setValue(null);
  }
  ctrl.markAsTouched();
  this.syncAllCopied();
}

copySuGrr(forceOverwrite = false): void {
  const ctrl = this.borrower.get('adjustedSuGrrPercentage');
  const archived = this.borrower.get('archivedSuGrrPercentage').value;
  if (forceOverwrite || ctrl.value !== archived) {
    ctrl.setValue(archived);
  } else {
    ctrl.reset();
  }
  ctrl.markAsTouched();
  this.syncAllCopied();
}

copyOrRemoveAll(): void {
  if (!this.allCopied()) {
    this.copyCounterpartyRating(true);
    this.copySuGrr(true);
  } else {
    this.borrower.get('adjustedCounterpartyRating').setValue(null);
    this.borrower.get('adjustedSuGrrPercentage').setValue(null);
    this.syncAllCopied();
  }
}

private syncAllCopied(): void {
  const b = this.borrower.getRawValue();
  this.allCopied.set(b.adjustedCounterpartyRating != null && b.adjustedSuGrrPercentage != null);
}

getPgnnrTopErrors(): string[] {
  const f = this.selectedFacilityItem()?.facilityBorrower?.facilityCharacteristics?.facilityName
         || this.facilityGrrForm().get('characteristics.functionalId')?.value;
  const bo = this.workflowDTO()?.facilityBasket?.counterparty?.characteristics?.companyName;
  const errors: string[] = [];
  if (this.borrower.get('adjustedCounterpartyRating').hasError('required'))
    errors.push($localize`:@@pgnnrNoCounterpartyRating:${f}:facility: : Il n'y a pas de note de contrepartie disponible pour l'emprunteur ${bo}:borrower:`);
  if (this.borrower.get('adjustedSuGrrPercentage').hasError('required'))
    errors.push($localize`:@@pgnnrNoSuGrr:${f}:facility: : Il n'y a pas de TRG SU disponible pour l'emprunteur ${bo}:borrower:`);
  if (this.borrower.get('adjustedDataComment').hasError('required'))
    errors.push($localize`:@@pgnnrOverrideJustification:${f}:facility: : Vous avez mis à jour la note de contrepartie et/ou le TRG SU de l'emprunteur. Une justification est obligatoire.`);
  return errors;
}


<div class="row-label">
  @if (modelUsed === MODEL_PGNNR) {
    <span i18n="@@lastSpecificRatingPolicy">Dernière politique de notation</span>
  } @else {
    <span i18n="Counterparty Rating Policy@@counterPartyRatingPolicy">Police de rating de la contrepartie</span>
  }
</div>


  @if (modelUsed !== MODEL_PGNNR) { ... }


@if (
  facilityGrrForm().get('borrower.overideGrrRatingPolicy').value &&
  facilityGrrForm().get('borrower.overideGrrRatingPolicy').value !== defaultGrrRatingPolicy
) {


} @else if (modelUsed === MODEL_PGNNR && facilityGrrForm().get('borrower.grrRatingPolicy')?.value) {
  <!-- En-tête -->
  <div class="row-item">
    <div class="row-label"></div>
    <div class="row-content ccd-header d-flex flex-row justify-content-between w-100">
      <div class="header-item d-flex flex-row justify-content-center align-items-center">
        <span bnppSvgIcon="description_18dp_4C4F4F_FILL0_wght400_GRAD0_opsz20" class="header-icon"></span>
        <span i18n="@@titleForArchivedData">Données Archivées</span>
      </div>
      <button type="button" class="header-btn" (click)="copyOrRemoveAll()">
        <span>{{ copyAllRemoveAllButtonLabel }}</span>
        <span bnppSvgIcon="arrow_range_18dp_4C4F4F_FILL0_wght400_GRAD0_opsz20" class="expand-icon grey-arrow-icon"></span>
        <span bnppSvgIcon="arrow_range_18dp_FFF_FILL0_wght400_GRAD0_opsz20" class="expand-icon white-arrow-icon"></span>
      </button>
      <div class="header-item d-flex flex-row justify-content-center align-items-center">
        <span bnppSvgIcon="check_circle_18dp_4C4F4F_FILL0_wght400_GRAD0_opsz20" class="header-icon"></span>
        <span i18n="@@titleForAdjustedData">Données Ajustées</span>
      </div>
    </div>
  </div>

  <!-- Note de contrepartie -->
  <div class="row-item fade-in">
    <div class="row-label" i18n="@@counterpartyratingLabel">Note de contrepartie</div>
    <div class="row-content w-100 d-flex flex-row justify-content-between gap-2 align-items-center">
      <bnpp-workflow-display-data-item class="w-50"
        [textContent]="facilityGrrForm().get('borrower.archivedCounterpartyRating')?.value || '/'"
        [selected]="!facilityGrrForm().get('borrower.adjustedCounterpartyRating')?.value"
        [readOnly]="true" [withoutCheckIcon]="true" [colorTheme]="'FACILITY_THEME'">
      </bnpp-workflow-display-data-item>
      <button type="button" class="header-btn d-flex flex-row justify-content-center align-items-center"
        [disabled]="!facilityGrrForm().get('borrower.archivedCounterpartyRating')?.value"
        (click)="copyCounterpartyRating()">
        <span i18n="@@copyLabel">Copy</span>
        <span bnppSvgIcon="arrow_range_18dp_4C4F4F_FILL0_wght400_GRAD0_opsz20" class="expand-icon grey-arrow-icon"></span>
        <span bnppSvgIcon="arrow_range_18dp_FFF_FILL0_wght400_GRAD0_opsz20" class="expand-icon white-arrow-icon"></span>
      </button>
      <bnpp-workflow-select-list class="w-50"
        [placeholder]="masterscalePlaceholder"
        [itemsList]="masterScaleOptions"
        [selectControl]="$any(facilityGrrForm().get('borrower.adjustedCounterpartyRating'))"
        [colorTheme]="facilityGrrForm().get('borrower.adjustedCounterpartyRating')?.value != null ? 'OVERRIDE_THEME' : 'DEFAULT_THEME'">
      </bnpp-workflow-select-list>
    </div>
  </div>
  @if (facilityGrrForm().get('borrower.adjustedCounterpartyRating')?.touched &&
       facilityGrrForm().get('borrower.adjustedCounterpartyRating')?.errors?.['required']) {
    <div class="field-error-container">
      <mat-error class="pull-right" i18n="@@requiredFieldLabel">This field is required</mat-error>
    </div>
  }

  <!-- SU GRR (%) -->
  <div class="row-item fade-in">
    <div class="row-label" i18n="@@SUGRRLabelCc">SU GRR (%)</div>
    <div class="row-content w-100 d-flex flex-row justify-content-between gap-2 align-items-center">
      <bnpp-workflow-display-data-item class="w-50"
        [textContent]="facilityGrrForm().get('borrower.archivedSuGrrPercentage')?.value ?? '/'"
        [selected]="facilityGrrForm().get('borrower.adjustedSuGrrPercentage')?.value == null"
        [readOnly]="true" [withoutCheckIcon]="true" [colorTheme]="'FACILITY_THEME'">
      </bnpp-workflow-display-data-item>
      <button type="button" class="header-btn d-flex flex-row justify-content-center align-items-center"
        [disabled]="facilityGrrForm().get('borrower.archivedSuGrrPercentage')?.value == null"
        (click)="copySuGrr()">
        <span i18n="@@copyLabel">Copy</span>
        <span bnppSvgIcon="arrow_range_18dp_4C4F4F_FILL0_wght400_GRAD0_opsz20" class="expand-icon grey-arrow-icon"></span>
        <span bnppSvgIcon="arrow_range_18dp_FFF_FILL0_wght400_GRAD0_opsz20" class="expand-icon white-arrow-icon"></span>
      </button>
      <bnpp-workflow-input-number class="w-50"
        [control]="$any(facilityGrrForm().get('borrower.adjustedSuGrrPercentage'))"
        [formFieldLabel]="''" [placeholderKey]="''">
      </bnpp-workflow-input-number>
    </div>
  </div>
  @if (facilityGrrForm().get('borrower.adjustedSuGrrPercentage')?.touched &&
       facilityGrrForm().get('borrower.adjustedSuGrrPercentage')?.errors?.['required']) {
    <div class="field-error-container">
      <mat-error class="pull-right" i18n="@@requiredFieldLabel">This field is required</mat-error>
    </div>
  }

  <!-- Commentaire (BR09) -->
  <div class="row-item fade-in">
    <div class="row-label" i18n="@@CommonComment">Commentaire</div>
    <div class="row-content"><div class="w-100">
      <bnpp-workflow-comment
        [placeholder]="adjustedCommentPlaceholder"
        [commentFormcontrol]="$any(facilityGrrForm().get('borrower.adjustedDataComment'))"
        [maxChars]="maxChars()">
      </bnpp-workflow-comment>
    </div></div>
  </div>
  @if (facilityGrrForm().get('borrower.adjustedDataComment')?.touched &&
       facilityGrrForm().get('borrower.adjustedDataComment')?.errors?.['required']) {
    <div class="field-error-container">
      <mat-error i18n="@@requiredFieldLabel">This field is required</mat-error>
    </div>
  }
}


