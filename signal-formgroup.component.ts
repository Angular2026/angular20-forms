private syncModelSpecificOverrides(modelDescription: string | null): void {
  const group = this.ccDecisionsForm
    .get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
  if (!group) return;

  const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
  const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
  const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

  // ✅ Supprimer uniquement les controls qui ne font plus partie du modèle
  Object.keys(group.controls)
    .filter(k => !fields.includes(k))
    .forEach(k => group.removeControl(k));

  // ✅ Ajouter uniquement les controls MANQUANTS → ne touche pas aux valeurs existantes
  fields.forEach(name => {
    if (!group.contains(name)) {
      group.addControl(
        name,
        this.formBuilder.control(null, isRating ? Validators.required : null)
      );
    } else {
      // Met à jour seulement le validator, pas la valeur
      const ctrl = group.get(name);
      isRating
        ? ctrl?.addValidators(Validators.required)
        : ctrl?.removeValidators(Validators.required);
      ctrl?.updateValueAndValidity({ emitEvent: false });
    }
  });

  group.updateValueAndValidity();
}



setDecisionsValues() {
  // ... tous les autres setValue existants ...

  this.ccDecisionsForm
    .get('ratingCcDecision.ratingModel')
    ?.setValue(this.ccDecision?.ratingCcDecision?.ratingModel, { emitEvent: false });

  // ✅ Sync manuel avec le bon modèle → crée les controls VIDES
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;
  if (model) {
    this.syncModelSpecificOverrides(model);
  }

  // ✅ Set les overrides APRÈS → controls déjà existants, pas recréés grâce au fix de syncModelSpecificOverrides
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
