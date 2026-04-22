// Dans setDecisionsValues
const model = this.ccDecision?.ratingCcDecision?.ratingModel;
const overrides = this.ccDecision?.ratingCcDecision?.modelSpecificOverrides;

this.ccDecisionsForm
  .get('ratingCcDecision.ratingModel')
  ?.setValue(model, { emitEvent: false });

// ✅ On passe les overrides directement → valeurs baked dans les controls dès la création
this.syncModelSpecificOverrides(model, overrides ?? undefined);


// syncModelSpecificOverrides modifiée
private syncModelSpecificOverrides(
  modelDescription: string | null,
  initialValues?: Record<string, any>  // ✅ nouveau paramètre optionnel
): void {
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
      this.formBuilder.control(
        initialValues?.[name] ?? null, // ✅ valeur initiale baked dans le control
        isRating ? Validators.required : null
      )
    );
  });
  group.updateValueAndValidity();
}
