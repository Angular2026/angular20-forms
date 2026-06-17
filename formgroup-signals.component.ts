// remove: private readonly invalidSubsidiary = (control: AbstractControl) => ({invalidSubsidiary: true});

private currentSubsidiaryValidator: ValidatorFn | null = null;

private buildInvalidSubsidiaryValidator(alertTextIds: string[]): ValidatorFn {
  return (): ValidationErrors | null => {
    const errors: ValidationErrors = {};
    alertTextIds.forEach(id => (errors[id] = true));
    return errors;
  };
}


if (response.errorsList.length > 0) {
  this.handlePropagationErrors(selectValue, response);
  const alertTextIds = response.errorsList.map(error => error.alertTextId);

  response.errorsList.forEach(error => {
    this.workflowValidationService.addWorkflowAlerts('errors', [
      {
        alertTextId: error,
        anchorId: 'rmpmidForInheritanceSearch',
        fragmentId: 'counterpartyRating',
      },
    ]);
  });

  this.isSubsidiaryCounterpartyValidated = false;
  this.propagationService.updateSubsidiaryEntitySelectionValidity(this.isSubsidiaryCounterpartyValidated);

  this.currentSubsidiaryValidator = this.buildInvalidSubsidiaryValidator(alertTextIds);
  control.addValidators([this.currentSubsidiaryValidator]);
  control.updateValueAndValidity();
} else {
  this.isSubsidiaryCounterpartyValidated = true;
  this.propagationService.updateSubsidiaryEntitySelectionValidity(this.isSubsidiaryCounterpartyValidated);
  // ...selectedSubsidiary payload unchanged...
  this.setSubsidiaryDetails(selectedSubsidiary);

  if (this.currentSubsidiaryValidator) {
    control.removeValidators([this.currentSubsidiaryValidator]);
    this.currentSubsidiaryValidator = null;
    control.updateValueAndValidity();
  }
}
