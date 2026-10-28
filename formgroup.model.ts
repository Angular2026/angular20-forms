case 'DISPLAY_DIALOG':
  this.saveForm();
  this.checkWorkflowErrors();
  this.workflowValidationService.workflowSaveIsProcessing.pipe(
    filter(isProcessing => !isProcessing),
    take(1),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(() => this.displayDialog());
  break;


// dans le service
get isSaving(): boolean {
  return this.counter > 0;
}

// dans actionOnRating
case 'DISPLAY_DIALOG':
  this.saveForm();
  this.checkWorkflowErrors();
  if (!this.workflowValidationService.isSaving) {
    this.displayDialog();               // aucun save lancé
  } else {
    this.workflowValidationService.workflowSaveIsProcessing.pipe(
      filter(isProcessing => !isProcessing),
      take(1),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.displayDialog());
  }
  break;
