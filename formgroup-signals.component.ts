readonly canCompute = computed(() => {
  const v = this.formValue();
  if (!v.sponsorInvolvement) return false;

  // Case 1 : rating externe
  // Déclenche si : externalRating + externalRatingSource renseignés
  // Ignore : sponsorType, turnover, AUM, currency → pas testés
  if (v.hasExternalRating === true)
    return !!v.externalRating && !!v.externalRatingSource;

  // Case 2 : Corporate sans rating
  // Déclenche si : sponsorTurnoverCurrency renseignée
  // Ignore : externalRating, AUM, assetsUnderManagementCurrency
  if (v.hasExternalRating === false && v.sponsorType === 'CORPORATE')
    return !!v.sponsorTurnoverCurrency;

  // Case 3 : Other sans rating
  // Déclenche si : assetsUnderManagementCurrency renseignée
  // Ignore : externalRating, turnover, sponsorTurnoverCurrency
  if (v.hasExternalRating === false && v.sponsorType === 'OTHER')
    return !!v.assetsUnderManagementCurrency;

  return false;
});


private readonly strengthComputePayload = computed<SponsorStrengthComputePayload | null>(() => {
  if (!this.canCompute()) return null;

  const v = this.formValue();
  const rmpmId = this.rmpmId();

  // Case 1
  if (v.hasExternalRating === true) {
    return {
      rmpmid:                    rmpmId,
      crfInternalOrExternalRating: v.externalRating ?? null,
      sponsorType:               null,
      sponsorInvolvement:        v.sponsorInvolvement,
      sponsorTurnover:           null,   // ← null direct, pas String(null)
      assetsUnderManagement:     null,   // ← null direct, pas String(null)
      currencyCode:              null,
    };
  }

  // Case 2 — Corporate
  if (v.sponsorType === 'CORPORATE') {
    return {
      rmpmid:                    rmpmId,
      crfInternalOrExternalRating: null,
      sponsorType:               'CORPORATE',
      sponsorInvolvement:        v.sponsorInvolvement,
      sponsorTurnover:           v.sponsorTurnover != null ? String(v.sponsorTurnover) : null,
      assetsUnderManagement:     null,
      currencyCode:              v.sponsorTurnoverCurrency ?? null,
    };
  }

  // Case 3 — Other
  return {
    rmpmid:                    rmpmId,
    crfInternalOrExternalRating: null,
    sponsorType:               'OTHER',
    sponsorInvolvement:        v.sponsorInvolvement,
    sponsorTurnover:           null,
    assetsUnderManagement:     v.assetsUnderManagement != null ? String(v.assetsUnderManagement) : null,
    currencyCode:              v.assetsUnderManagementCurrency ?? null,
  };
});





filter((p): p is SponsorStrengthComputePayload => p !== null),
distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
debounceTime(300),   // ← si absent, chaque keystroke déclenche un appel
switchMap(...)
