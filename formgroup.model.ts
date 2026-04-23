// La méthode parente doit être async
private async setFormValues(): Promise<void> {

  // ... tous tes setValue existants ...

  this.ccDecisionsForm.get('ratingCcDecision.ratingModel')
    .setValue(this.ccDecision?.ratingCcDecision?.ratingModel);

  const overrides = this.ccDecision?.ratingCcDecision?.modelSpecificOverrides;
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;

  if (overrides && model) {
    await this.syncModelSpecificOverrides(model); // ✅ on attend que les controls soient créés

    Object.keys(overrides).forEach(key => {
      this.ccDecisionsForm
        .get(`ratingCcDecision.modelSpecificOverrides.${key}`)
        ?.setValue(overrides[key]); // ✅ controls existent maintenant
    });
  }
}


private syncModelSpecificOverrides(modelDescription: string | null): Promise<void> {
  return new Promise((resolve) => {
    const group = this.ccDecisionsForm.get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
    if (!group) {
      resolve();
      return;
    }

    Object.keys(group.controls).forEach(key => group.removeControl(key));

    const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
    const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
    const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

    fields.forEach(name => {
      group.addControl(name, this.formBuilder.control(null, isRating ? Validators.required : null));
    });

    group.updateValueAndValidity();
    resolve(); // ✅ controls bien créés avant de continuer
  });
}
