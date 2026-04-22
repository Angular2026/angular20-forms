private isLoadingData = false;

setDecisionsValues() {
  this.isLoadingData = true; // 🔒 Bloque le sync pendant le chargement

  // ... tous les setValue existants ...
  this.ccDecisionsForm.get('ratingCcDecision.ratingModel')
    ?.setValue(this.ccDecision?.ratingCcDecision?.ratingModel);

  // ✅ Sync manuel UNE seule fois avec le bon modèle
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;
  if (model) {
    this.syncModelSpecificOverrides(model);
  }

  // ✅ Set les overrides APRÈS le sync manuel
  const overrides = this.ccDecision?.ratingCcDecision?.modelSpecificOverrides;
  if (overrides) {
    const group = this.ccDecisionsForm
      .get('ratingCcDecision.modelSpecificOverrides') as FormGroup;

    if (group) {
      Object.keys(overrides).forEach(key => {
        if (!group.contains(key)) {
          group.addControl(key, this.formBuilder.control(null));
        }
        group.get(key)?.setValue(overrides[key]);
      });
      group.updateValueAndValidity();
    }
  }

  this.isLoadingData = false; // 🔓 Réactive le sync
}



private syncModelSpecificOverrides(modelDescription: string | null): void {
  // ✅ Ne pas re-sync si on est en train de charger les données
  if (this.isLoadingData) return;

  const group = this.ccDecisionsForm
    .get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
  if (!group) return;

  const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
  const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
  const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

  Object.keys(group.controls).forEach(k => group.removeControl(k));
  fields.forEach(name => {
    group.addControl(
      name,
      this.formBuilder.control(null, isRating ? Validators.required : null)
    );
  });
  group.updateValueAndValidity();
}
