constructor() {
  // ... reste du constructor

  toObservable(this.strengthComputePayload).pipe(
    filter((p): p is SponsorStrengthComputePayload => p !== null),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    debounceTime(300),
    switchMap(payload => this.counterPartyRatingService.computeSponsorStrength(payload)),
    takeUntilDestroyed(this.destroyRef$),
  ).subscribe((response: number) => {
    this.externalSponsorForm.get('sponsorStrength')?.setValue(
      this.SPONSOR_STRENGTH_MAP[response] ?? '',
      { emitEvent: false }, // ← évite la boucle infinie
    );
  });
}



// Est-ce qu'on a assez de data pour appeler l'API ?
readonly canComputeStrength = computed(() => {
  const v = this.formValue();
  if (!v.sponsorInvolvement) return false;

  // Cas 1 : rating externe renseigné
  if (v.hasExternalRating === true && v.externalRating) return true;

  // Cas 2 : pas de rating, mais type + currency selon le type
  if (v.hasExternalRating === false && v.sponsorType) {
    if (v.sponsorType === 'CORPORATE' && v.sponsorTurnoverCurrency) return true;
    if (v.sponsorType === 'OTHER' && v.assetsUnderManagementCurrency) return true;
  }
  return false;
});

// Payload mémoisé — ne se recalcule que quand les deps changent
private readonly strengthComputePayload = computed<SponsorStrengthComputePayload | null>(() => {
  if (!this.canComputeStrength()) return null;
  const v = this.formValue();
  return {
    rmpmid: null, // external sponsor = pas de RMPM ID
    crfInternalOrExternalRating: v.externalRating ?? null,
    sponsorType: v.sponsorType ?? null,
    sponsorInvolvement: v.sponsorInvolvement,
    sponsorTurnover: v.sponsorTurnover ?? null,
    assetsUnderManagement: v.assetsUnderManagement ?? null,
    currencyCode: v.sponsorType === 'CORPORATE'
      ? v.sponsorTurnoverCurrency
      : v.assetsUnderManagementCurrency,
  };
});



private readonly SPONSOR_STRENGTH_MAP: Readonly<Record<number, string>> = {
  1: 'Strong and Involved',
  2: 'Strong and Not Involved',
  3: 'Weak',
};
