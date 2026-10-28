case 'DISPLAY_DIALOG':
  this.saveForm();
  this.checkWorkflowErrors();
  this.workflowValidationService.isSaving$.pipe(
    filter(saving => !saving),
    take(1),
    takeUntilDestroyed(this.destroyRef)
  ).subscribe(() => this.displayDialog());
  break;

private pendingSaves = 0;
private readonly saving$ = new BehaviorSubject<boolean>(false);
readonly isSaving$ = this.saving$.asObservable();

startWorkflowSavingProcess() {
  this.pendingSaves++;
  this.saving$.next(true);
}
endWorkflowSavingProcess() {
  this.pendingSaves = Math.max(0, this.pendingSaves - 1);
  if (this.pendingSaves === 0) this.saving$.next(false);
}
