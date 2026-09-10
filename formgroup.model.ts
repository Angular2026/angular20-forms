private addCurrentSRPControl(): void {
  const nextValue = this.ratingPolicySelectionDetails?.currentSrpUsed ?? null;
  const existing = this.ratingPolicySelectionForm.get('currentSrpUsed');

  if (existing) {
    // Le control existe déjà : on ne le recrée pas.
    // Si la valeur est identique, on ne touche à rien du tout —
    // sinon on relancerait le validator async pour rien.
    if (existing.value !== nextValue) {
      existing.setValue(nextValue, { emitEvent: false });
    }
    this.syncCurrentSRPControlDisabledState(existing);
    return;
  }

  this.ratingPolicySelectionForm.addControl(
    'currentSrpUsed',
    new FormControl(
      { value: nextValue, disabled: !this.userHaveRightWriterOnRight },
      Validators.required,
      this.frbSrpAuthorizedValidator,
    ),
    { emitEvent: false },
  );

  if (nextValue) {
    this.handleLoadingSRPSummaryComponent();
  }
}

private syncCurrentSRPControlDisabledState(control: AbstractControl): void {
  const shouldDisable = !this.userHaveRightWriterOnRight;
  if (shouldDisable && control.enabled) {
    control.disable({ emitEvent: false });
  } else if (!shouldDisable && control.disabled) {
    control.enable({ emitEvent: false });
  }
}


private lastValidated: { srp: string; result: ValidationErrors | null } | null = null;

private frbSrpAuthorizedValidator: AsyncValidatorFn = (control) => {
  const selectedSrp = control.value;
  if (!selectedSrp) return of(null);
  if (this.lastValidated?.srp === selectedSrp) return of(this.lastValidated.result);

  return timer(300).pipe(
    switchMap(() => this.workflowService.validateSrpSelection(this.workflowDTO(), selectedSrp)),
    map(r => {
      const result = r.isValid ? null : { notAuthorizedFrbSrp: true };
      this.lastValidated = { srp: selectedSrp, result };
      return result;
    }),
    take(1)
  );
};


