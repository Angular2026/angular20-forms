private frbSrpAuthorizedValidator = (control: AbstractControl): ValidationErrors | null => {
  if (this.frbRatingPerimeter !== 'Y') {
    return null;
  }
  return isSrpAuthorizedForFrb(control.value) ? null : { notAuthorizedFrbSrp: true };
};

private addCurrentSRPControl() {
  this.ratingPolicySelectionForm.addControl(
    'currentSrpUsed',
    new FormControl(
      { value: this.ratingPolicySelectionDetails?.currentSrpUsed ?? null, disabled: !this.userHaveRightWriterOnRight },
      Validators.compose([Validators.required, this.frbSrpAuthorizedValidator]),
    ),
  );
  // ...
}

resetRatingPolicySelectionFormm(policy): void {
  this.ratingPolicySelectionForm = this.formBuilder.group({
    currentSrpUsed: [policy, Validators.compose([Validators.required, this.frbSrpAuthorizedValidator])],
  });
}

private checkFrbSrpAuthorization = (): void => {
  const srpControl = this.ratingPolicySelectionForm.get('currentSrpUsed');
  srpControl?.updateValueAndValidity(); // réévalue la chaîne de validateurs, y compris frbSrpAuthorizedValidator

  if (srpControl?.hasError('notAuthorizedFrbSrp')) {
    srpControl.markAsTouched();
    this.alertsBoxService.addAlerts('errors', [
      { alertTextId: 'notAuthorizedFrbSrp', fragmentId: 'specificRatingPolicyChoice', anchorId: 'specificRatingPolicyChoice' },
    ]);
  }
};
