handleSugrrModelChanges() {
  this.workflowService.sugrrModel$.pipe(takeUntilDestroyed(this.destroyRef$)).subscribe(value => {
    if (value) {
      this.previousSugrrModel = this.sugrrModel;
      this.sugrrModel = value;

      const sugrrGroup = this.ratingForm.get('sugrrRating') as FormGroup;
      const newFields = this.buildSuGrrForm(false).controls;

      this.syncSugrrControls(sugrrGroup, newFields);
      this.clearStaleSugrrControls(sugrrGroup, newFields);

      sugrrGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  });
}

/**
 * Adds new controls to the group, or updates the value/validators of
 * controls that already exist (never replaces their instance).
 */
private syncSugrrControls(sugrrGroup: FormGroup, newFields: { [key: string]: AbstractControl }): void {
  Object.entries(newFields).forEach(([key, control]) => {
    const existing = sugrrGroup.get(key);
    if (existing) {
      existing.setValue(control.value, { emitEvent: false });
      existing.setValidators(control.validator);
      existing.updateValueAndValidity({ emitEvent: false });
    } else {
      sugrrGroup.addControl(key, control);
    }
  });
}

/**
 * Resolves the relevant subgroup based on the current SuGrr model type,
 * then strips validators from controls that no longer belong to the
 * new schema (without ever removing the controls themselves).
 */
private clearStaleSugrrControls(sugrrGroup: FormGroup, newFields: { [key: string]: AbstractControl }): void {
  let targetGroup: FormGroup = sugrrGroup;
  let existingKeys: string[] = Object.keys(sugrrGroup.controls);

  if (this.sugrrModel === this.pdLargeSuGrrModel) {
    targetGroup = sugrrGroup;
    existingKeys = Object.keys(sugrrGroup.controls);
  } else if (this.sugrrModel === this.assetFinanceSuGrrModel) {
    targetGroup = this.ratingForm.get('sugrrRating.sugrrDriver') as FormGroup;
    existingKeys = Object.keys(targetGroup.controls);
  }

  existingKeys.forEach(key => {
    if (!(key in newFields)) {
      const stale = targetGroup?.get(key);
      stale?.clearValidators();
      stale?.updateValueAndValidity({ emitEvent: false });
    }
  });
}
