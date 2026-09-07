handleSugrrModelChanges() {
  this.workflowService.sugrrModel$.pipe(takeUntilDestroyed(this.destroyRef$)).subscribe(value => {
    if (value) {
      this.previousSugrrModel = this.sugrrModel;
      this.sugrrModel = value;

      const sugrrGroup = this.ratingForm.get('sugrrRating') as FormGroup;
      const newFields = this.buildSuGrrForm(false).controls; // the group you'd have swapped in

      Object.entries(newFields).forEach(([key, control]) => {
        if (sugrrGroup.contains(key)) {
          // existing field — just update its value, keep instance/bindings
          sugrrGroup.get(key)?.setValue(control.value, { emitEvent: false });
        } else {
          // new field — add it
          sugrrGroup.addControl(key, control);
        }
      });

      // optional: remove fields that no longer apply to this obligor type
      Object.keys(sugrrGroup.controls).forEach(key => {
        if (!(key in newFields)) {
          sugrrGroup.removeControl(key);
        }
      });

      sugrrGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  });
}
