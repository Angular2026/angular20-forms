private syncModelSpecificOverrides(modelDescription: string | null): void {
  const group = this.ccDecisionsForm
    .get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
  if (!group) return;

  // ✅ Guard : ne pas recréer les controls s'ils existent déjà pour ce modèle
  const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
  const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
  const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

  const existingKeys = Object.keys(group.controls);
  const sameControls =
    existingKeys.length === fields.length &&
    fields.every(f => existingKeys.includes(f));

  if (sameControls) return; // Pas besoin de reconstruire

  Object.keys(group.controls).forEach(k => group.removeControl(k));
  fields.forEach(name => {
    group.addControl(
      name,
      this.formBuilder.control(null, isRating ? Validators.required : null)
    );
  });
  group.updateValueAndValidity();
}
