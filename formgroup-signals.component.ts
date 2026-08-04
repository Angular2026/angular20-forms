workflowDTO = input.required<WorkflowDocument>(); // input existant, inchangé

// copie locale writable
private _workflowDTOLocal = signal<WorkflowDocument>(this.workflowDTO());

// se resynchronise si le parent repasse une nouvelle référence
private syncEffect = effect(() => {
  this._workflowDTOLocal.set(this.workflowDTO());
}, { allowSignalWrites: true });

// accès readonly pour le reste du composant
workflowDTOLocal = this._workflowDTOLocal.asReadonly();


.subscribe(response => {
  this._workflowDTOLocal.update(dto => ({ ...dto, counterPartyRating: response }));
  const newWorkflow = this._workflowDTOLocal();

  this.router.navigate([`/counterparty/detail/${this.rmpmId()}/workflows`], {
    state: newWorkflow,
    queryParams: { workflowId: newWorkflow.encryptedUUID, category: newWorkflow.category?.map(c => c.value) },
    onSameUrlNavigation: 'ignore',
  });
  this.alertsBoxService.setSectionValid('counterpartyRating');
});
