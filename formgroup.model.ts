private listenGrrPolicyOverride(): void {
  const b = this.facilityGrrForm().get('borrower');
  b.get('overideGrrRatingPolicy').valueChanges.pipe(
    map(override => getRatingModelFromGrrPolicy(override ?? b.get('grrRatingPolicy').value)),
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef),
  ).subscribe(model => this.applyOverrideModel(model));
}

private applyOverrideModel(model: RatingModelCode | null): void {
  if (!model) return;
  this.modelUsed = RatingModelDescription[model]; // no setModel(): SRP and default policy stay unchanged
  switch (model) {
    case RatingModelCode.GLOBAL_NON_RETAIL_RATING:
      this.applyPgnnrBorrowerRules();
      break;
    case RatingModelCode.PD_PROJECT_FINANCE:
      this.clearPgnnrRules();
      this.applyProjectFinanceBorrowerRules(); // ⚠️ see note below
      break;
    case RatingModelCode.PD_ASSET_FINANCE:
      this.clearPgnnrRules();
      break;
    default:
      this.clearPgnnrRules();
      this.applyPdLargeCorpBorrowerRules();
  }
}


this.getModelUsed();
this.listenGrrPolicyOverride();
if (!this.isPgnnrModel) {
  this.fetchSalesForRmpmId(this.rmpmId());
  this.loadCurrentRatingApproved(this.rmpmId());
}
// ...
if (!this.isPgnnrModel) {
  this.facilitiesService.getSugrrDriverRatingArchivedData(...).subscribe(...);
}
