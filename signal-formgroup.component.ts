const overrides = this.ccDecision?.ratingCcDecision?.modelSpecificOverrides;
console.log('overrides', overrides, this.ccDecisionsForm.get('ratingCcDecision.modelSpecificOverrides.approvedSuGrrPercentage'));

if (overrides) {
  // ✅ Sync les controls d'abord avant de setValue
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;
  if (model) {
    this.syncModelSpecificOverrides(model);
  }

  Object.keys(overrides).forEach(key => {
    this.ccDecisionsForm
      .get(`ratingCcDecision.modelSpecificOverrides.${key}`)
      ?.setValue(overrides[key]); // ✅ ?. évite le crash si control absent
  });
}
