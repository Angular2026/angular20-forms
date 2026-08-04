.subscribe(response => {
  // refresh new rating in window history
  this.workflowDTO.update(dto => ({ ...dto, counterPartyRating: response }));
  const newWorkflow = this.workflowDTO(); // nouvelle référence, propre

  this.router.navigate([`/counterparty/detail/${this.rmpmId()}/workflows`], {
    state: newWorkflow,
    queryParams: { workflowId: newWorkflow.encryptedUUID, category: newWorkflow.category?.map(c => c.value) },
    onSameUrlNavigation: 'ignore',
  });
  // clear errors box
  this.alertsBoxService.setSectionValid('counterpartyRating');
});
