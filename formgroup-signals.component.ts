private workflowDTOLocal = linkedSignal(() => this.workflowDTO());


.subscribe(response => {
  this.workflowDTOLocal.update(dto => ({ ...dto, counterPartyRating: response }));
  const newWorkflow = this.workflowDTOLocal();

  this.router.navigate([`/counterparty/detail/${this.rmpmId()}/workflows`], {
    state: newWorkflow,
    queryParams: { workflowId: newWorkflow.encryptedUUID, category: newWorkflow.category?.map(c => c.value) },
    onSameUrlNavigation: 'ignore',
  });
  this.alertsBoxService.setSectionValid('counterpartyRating');
});
