case 'DISPLAY_DIALOG': {
  // Subscribe BEFORE triggering the save so neither the start nor the end can be missed
  const dialogSub = this.workflowValidationService.workflowSaveIsProcessing
    .pipe(
      distinctUntilChanged(),
      skipWhile(isProcessing => !isProcessing), // wait for the save to START (true)
      filter(isProcessing => !isProcessing),    // then for it to FINISH (false)
      take(1),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(() => this.displayDialog());

  const saveTriggered = this.saveForm();
  this.checkWorkflowErrors(); // after saveForm: saveForm clears all alerts

  if (!saveTriggered) {
    dialogSub.unsubscribe(); // nothing to save in this state -> open right away
    this.displayDialog();
  }
  break;
}

this.workflowValidationService.workflowSaveIsProcessing
  .pipe(take(4))
  .subscribe(v => console.log('[SAVE] processing', v));
