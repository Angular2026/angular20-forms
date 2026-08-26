private frbSrpAuthorizedValidator: AsyncValidatorFn = (control: AbstractControl) => {
  if (this.frbRatingPerimeter !== 'Y') {
    return of(null);
  }

  const selectedSrp = control.value;

  return this.workflowService
    .validateSrpSelection(this.workflowDTO(), selectedSrp)
    .pipe(
      take(1),
      takeUntilDestroyed(this.destroyRef),
      map((srpValidationResult: SrpValidationResult) =>
        srpValidationResult.isValid ? null : { notAuthorizedFrbSrp: true }
      )
    );
};
