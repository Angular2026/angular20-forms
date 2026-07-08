readonly closingDateValidatorEffect = effect(() => {
  const debtToEquityValue = this.formValue()?.debtToEquity;
  const closingDateControl = this.constructionForm.controls.closingDate;

  const validators = hasValue(debtToEquityValue)
    ? [Validators.required, maxMonthsOldValidator('closingDate21Months', 21)]
    : [maxMonthsOldValidator('closingDate21Months', 21)];

  closingDateControl.setValidators(validators);
  closingDateControl.updateValueAndValidity({ emitEvent: false });
});
