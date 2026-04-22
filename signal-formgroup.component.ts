if (overrides) {
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;
  if (model) {
    this.syncModelSpecificOverrides(model);
  }

  const group = this.ccDecisionsForm
    .get('ratingCcDecision.modelSpecificOverrides') as FormGroup;

  if (group) {
    Object.keys(overrides).forEach(key => {
      // ✅ Si le control n'existe pas dans MODEL_SPECIFIC_FIELDS → on le crée quand même
      if (!group.contains(key)) {
        console.warn(`Control "${key}" manquant dans MODEL_SPECIFIC_FIELDS pour ${model} → création dynamique`);
        group.addControl(key, this.formBuilder.control(null));
      }
      group.get(key)?.setValue(overrides[key]);
    });
    group.updateValueAndValidity();
  }
}
