handleSugrrModelChanges() {
  this.workflowService.sugrrModel$.pipe(takeUntilDestroyed(this.destroyRef$)).subscribe(value => {
    if (value) {
      this.previousSugrrModel = this.sugrrModel;
      this.sugrrModel = value;

      const sugrrGroup = this.ratingForm.get('sugrrRating') as FormGroup;
      const newFields = this.buildSuGrrForm(false).controls;

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

      // determine which group + keys to check for stale controls, based on model type
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

      sugrrGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  });
}
