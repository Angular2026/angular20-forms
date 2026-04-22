setDecisionsValues() {
  // ... tous les autres setValue ...

  // ✅ emitEvent: false → ne déclenche PAS valueChanges → pas de sync intempestif
  this.ccDecisionsForm
    .get('ratingCcDecision.ratingModel')
    ?.setValue(this.ccDecision?.ratingCcDecision?.ratingModel, { emitEvent: false });

  // ✅ Sync manuel une seule fois
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;
  if (model) {
    this.syncModelSpecificOverrides(model);
  }

  // ✅ Set les overrides APRÈS — controls garantis existants
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
}
