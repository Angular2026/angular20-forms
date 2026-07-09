// injections à ajouter en haut de la classe (à côté de formBuilder, destroyRef)
private readonly counterpartyRatingService = inject(CounterpartyRatingService); // à adapter au vrai nom du service injecté dans CountryDataComponent

// signal alimenté par l'appel API, plus un computed() synchrone
private readonly hostCountryRegion = signal<string | null>(null);

private fetchHostCountryRegion(): void {
  const hostCountryCode = this.workflowDTO().counterPartyRating?.hostCountry?.code; // TODO: confirmer le chemin exact
  if (!hostCountryCode) {
    this.hostCountryRegion.set(null);
    return;
  }

  this.counterpartyRatingService
    .getCountryData(hostCountryCode)
    .pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe({
      next: data => this.hostCountryRegion.set(data?.region ?? null),
      error: () => this.hostCountryRegion.set(null),
    });
}


readonly isStrongFundamentals = computed<boolean>(() => {
  const sector = this.formValue().projectSector;
  const subSector = this.formValue().projectSubSector;
  if (!sector || !subSector) {
    return false;
  }

  const hostCountryRegion = this.hostCountryRegion(); // lecture du signal alimenté par l'API

  const meetsCondition1 =
    hostCountryRegion === 'EMEA' &&
    STRONG_FUNDAMENTALS_UPLIFT_PAIRS.some(pair => pair.sector === sector && pair.subSector === subSector);

  const meetsCondition2 = STRONG_FUNDAMENTALS_UPLIFT_SECTORS.includes(sector);

  return meetsCondition1 || meetsCondition2;
});
