private syncModelSpecificOverrides(modelDescription: string | null): void {
  const group = this.ccDecisionsForm
    .get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
  if (!group) return;

  const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
  const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
  const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

  // ✅ Snapshot des valeurs actuelles AVANT de tout supprimer
  const existingValues: Record<string, any> = {};
  Object.keys(group.controls).forEach(k => {
    existingValues[k] = group.get(k)?.value;
  });

  // Supprimer et recréer les controls
  Object.keys(group.controls).forEach(k => group.removeControl(k));
  fields.forEach(name => {
    group.addControl(
      name,
      this.formBuilder.control(
        existingValues[name] ?? null, // ✅ Restaure la valeur si elle existait
        isRating ? Validators.required : null
      )
    );
  });

  group.updateValueAndValidity();
}
