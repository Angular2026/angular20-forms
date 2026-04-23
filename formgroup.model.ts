// Modifier la signature pour accepter les overrides
private syncModelSpecificOverrides(
  modelDescription: string | null,
  initialValues?: Record<string, any>  // ← nouveau paramètre
): void {
  const group = this.ccDecisionsForm.get('ratingCcDecision.modelSpecificOverrides') as FormGroup;
  if (!group) return;

  Object.keys(group.controls).forEach(key => group.removeControl(key));

  const isRating = this.workflowDTO()?.category?.some(c => c.value === 'RATING');
  const key = DESCRIPTION_TO_KEY_MAP[modelDescription];
  const fields = MODEL_SPECIFIC_FIELDS[key] ?? [];

  fields.forEach(name => {
    group.addControl(
      name,
      this.formBuilder.control(
        initialValues?.[name] ?? null,  // ← valeur injectée à la création
        isRating ? Validators.required : null
      )
    );
  });

  group.updateValueAndValidity();
}


if (overrides) {
  const model = this.ccDecision?.ratingCcDecision?.ratingModel;
  if (model) {
    this.syncModelSpecificOverrides(model, overrides);  // valeurs injectées dès la création ✅
  }
}

