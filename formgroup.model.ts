handleSugrrModelChanges() {
  this.workflowService.sugrrModel$.pipe(takeUntilDestroyed(this.destroyRef$)).subscribe(value => {
    if (value) {
      this.previousSugrrModel = this.sugrrModel;
      this.sugrrModel = value;

      const sugrrGroup = this.ratingForm.get('sugrrRating') as FormGroup;

      this.syncSugrrControls(sugrrGroup);
      this.clearStaleSugrrControls(sugrrGroup);

      sugrrGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  });
}

private syncSugrrControls(sugrrGroup: FormGroup): void {
  if (this.sugrrModel === this.pdLargeSuGrrModel) {
    const newForm = this.buildPDLargeSuGrrForm(false) as FormGroup;
    this.syncNestedGroup(sugrrGroup, 'sugrrDriver', newForm.get('sugrrDriver') as FormGroup);
    this.syncNestedGroup(sugrrGroup, 'sugrrCompute', newForm.get('sugrrCompute') as FormGroup);
    this.syncLeafControl(sugrrGroup, 'modelName', newForm.get('modelName'));
  } else if (this.sugrrModel === this.assetFinanceSuGrrModel) {
    const newForm = this.buildAssetFinanceSuGrrForm(false) as FormGroup;
    this.syncFlatGroup(sugrrGroup, newForm.controls);
  }
}

/** Adds a nested subgroup if absent, otherwise syncs its children in place. */
private syncNestedGroup(parent: FormGroup, key: string, newGroup: FormGroup): void {
  const existing = parent.get(key) as FormGroup | null;
  if (existing) {
    this.syncFlatGroup(existing, newGroup.controls);
  } else {
    parent.addControl(key, newGroup);
  }
}

/** Patches value/validators for existing controls, adds missing ones — never replaces instances. */
private syncFlatGroup(target: FormGroup, newFields: { [key: string]: AbstractControl }): void {
  Object.entries(newFields).forEach(([key, control]) => {
    const existing = target.get(key);
    if (existing) {
      existing.setValue(control.value, { emitEvent: false });
      existing.setValidators(control.validator);
      existing.updateValueAndValidity({ emitEvent: false });
    } else {
      target.addControl(key, control);
    }
  });
}

private syncLeafControl(parent: FormGroup, key: string, newControl: AbstractControl | null): void {
  if (!newControl) { return; }
  const existing = parent.get(key);
  if (existing) {
    existing.setValue(newControl.value, { emitEvent: false });
  } else {
    parent.addControl(key, newControl);
  }
}

private clearStaleSugrrControls(sugrrGroup: FormGroup): void {
  if (this.sugrrModel === this.pdLargeSuGrrModel) {
    // switching TO nested pdLarge: any flat asset-finance leaf controls sitting directly
    // on sugrrGroup are now stale (not part of pdLarge's shape)
    const assetFinanceKeys = Object.keys(this.buildAssetFinanceSuGrrForm(false).controls);
    assetFinanceKeys.forEach(key => this.clearControlValidators(sugrrGroup.get(key)));
  } else if (this.sugrrModel === this.assetFinanceSuGrrModel) {
    // switching TO flat assetFinance: pdLarge's nested subgroups are now stale
    ['sugrrDriver', 'sugrrCompute'].forEach(groupKey => {
      const group = sugrrGroup.get(groupKey) as FormGroup | null;
      if (group) {
        Object.keys(group.controls).forEach(key => this.clearControlValidators(group.get(key)));
      }
    });
  }
}

private clearControlValidators(control: AbstractControl | null): void {
  if (!control) { return; }
  control.clearValidators();
  control.updateValueAndValidity({ emitEvent: false });
}
