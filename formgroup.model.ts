case 'DISPLAY_DIALOG': {
  this.checkWorkflowErrors();
  const saved$ = this.workflowValidationService.workflowSaveResult$.pipe(
    take(1),
    takeUntilDestroyed(this.destroyRef),
  );
  saved$.subscribe(success => { if (success) this.displayDialog(); });

  if (!this.saveForm()) {
    this.displayDialog(); // nothing to save in this state
  }
  break;
}



saveForm(): boolean {
  this.alertsBoxService.clearAllAlerts();
  this.applyCounterpartyDefaultRestriction();
  let saveTriggered = false;
  if (this.isWorkflowTypeBothRatingAndFacility) { this.saveGroupedRating(); saveTriggered = true; }
  // ... same for each branch that calls a trigger
  return saveTriggered;
}

private workflowSaveResultSubject = new Subject<boolean>(); // true = saved, false = error
workflowSaveResult$ = this.workflowSaveResultSubject.asObservable();

notifyWorkflowSaved(success: boolean): void {
  this.workflowSaveResultSubject.next(success);
}
