private syncModelSpecificOverrides(modelDescription: string | null): Promise<void> {
  return new Promise((resolve) => {
    const group = this.ccDecisionsForm.get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
    if (!group) { resolve(); return; }

    Object.keys(group.controls).forEach(key => group.removeControl(key));

    const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
    const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
    const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

    fields.forEach(name => {
      group.addControl(name, this.formBuilder.control(null, isRating ? Validators.required : null));
    });

    group.updateValueAndValidity();

    setTimeout(resolve, 0); // ✅ macrotask : Angular a fini de traiter les controls
  });
}


if (overrides && model) {
  await this.syncModelSpecificOverrides(model); // attend le setTimeout
  Object.keys(overrides).forEach(key => {
    this.ccDecisionsForm
      .get(`ratingCcDecision.modelSpecificOverrides.${key}`)
      ?.setValue(overrides[key]);
  });
}
