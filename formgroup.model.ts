private baseFormControlNames: string[] = [];

initRatingPolicySelectionForm() {
  this.addCurrentSRPControl();
  // snapshot AVANT que le composant enfant n'ajoute ses controls dynamiques
  this.baseFormControlNames = Object.keys(this.ratingPolicySelectionForm.controls);

  if (this.ratingPolicySelectionDetails?.currentSrpUsed) {
    this.changeRatingPolicy(...);
  }
  // ... reste inchangé
}

private deactivateSrpDecisionTree(): void {
  this.container?.clear();
  this.componentRef = undefined;
  this.selectedSRPSummaryComponent = undefined;

  // retire tous les controls dynamiques ajoutés par le composant SRP enfant
  Object.keys(this.ratingPolicySelectionForm.controls)
    .filter(name => !this.baseFormControlNames.includes(name))
    .forEach(name => this.ratingPolicySelectionForm.removeControl(name));
}

handleLoadingSRPSummaryComponent() {
  if (this.shouldDeactivateSrpDecisionTree) {
    this.deactivateSrpDecisionTree();
    return;
  }

  this.registry
    .find(model => model.modelCode === this.modelType)
    ?.loadComponent()
    .then(componentRef => {
      this.selectedSRPSummaryComponent = componentRef;
      this.loadRequiredComponent();
    });
}

get shouldDeactivateSrpDecisionTree(): boolean {
  return (
    this.ratingPolicySelectionDetails?.frbRatingPerimeter === 'Y' &&
    this.isSrpAuthorizedForFrb(this.ratingPolicySelectionDetails?.frbModelCode)
  );
}
