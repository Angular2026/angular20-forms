/** Édition d'une facility : restaure la GRR policy enregistrée en base */
private restoreSavedGrrPolicy(): void {
  const saved = this.selectedFacilityItem()?.facilityBorrower?.counterpartyRatingPolicy;
  if (!saved) return;

  // Si c'est la policy par défaut, ce n'est pas un override
  if (saved.toUpperCase() === this.defaultGrrRatingPolicy?.toUpperCase()) return;

  // Récupère la value exacte de la liste, pour que le select l'affiche (casse identique)
  const option = this.ratingPoliciesList.find(o => o.value?.toUpperCase() === saved.toUpperCase());

  // Déclenche valueChanges → listenGrrPolicyOverride → applyOverrideModel → modelUsed à jour
  this.facilityGrrForm().get('borrower.overideGrrRatingPolicy')?.patchValue(option?.value ?? saved);
}

if (changes['selectedFacilityItem']?.currentValue && !changes['selectedFacilityItem'].firstChange) {
  this.restoreSavedGrrPolicy();
}
