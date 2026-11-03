private readonly defaultSavedSubject = new Subject<void>();
readonly defaultSaved$ = this.defaultSavedSubject.asObservable();

notifyDefaultSaved(): void {
  this.defaultSavedSubject.next();
}


this.workflowValidationService.startWorkflowSavingProcess();
const dataToPersist = this.mapFormToDefaultingClientSaveRequest();
this.defaultCounterPartyService
  .persistDefaultingClient(dataToPersist)
  .pipe(finalize(() => this.workflowValidationService.endWorkflowSavingProcess()))
  .subscribe(() => {
    this.alertsBoxService.setSectionValid('defaultCounterparty');
    this.defaultCounterPartyService.notifyDefaultSaved();
  });



this.defaultCounterPartyService.defaultSaved$
  .pipe(takeUntilDestroyed(this.destroyRef))
  .subscribe(() => this.persistData());
