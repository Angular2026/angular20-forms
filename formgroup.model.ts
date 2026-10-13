console.table(approved.map((wf, i) => ({
  index: i,
  categories: JSON.stringify(wf.category),
  hasDefaultingClient: wf.defaultingClient != null,
  btp: wf.defaultingClient?.backToPerforming?.counterpartyBackToPerforming,
  created: wf.createdTimestamp,
  modified: wf.modifiedTimestamp,
})));
console.log('defaultIndex =', defaultIndex);



private isBackToPerformingPending(wfList: WorkflowDocument[]): boolean {
  const approved = wfList.filter(wf => wf.currentState === 'APPROVED');

  // Last approved Default WF (list sorted most recent first)
  const defaultIndex = approved.findIndex(wf => wf.defaultingClient != null);
  if (defaultIndex === -1) {
    return false;
  }

  const btpYes = !!approved[defaultIndex].defaultingClient?.backToPerforming?.counterpartyBackToPerforming;
  if (!btpYes) {
    return false;
  }

  // A rating WF approved after the Default WF => BTP finalized, banner hidden
  const ratingApprovedAfter = approved
    .slice(0, defaultIndex)
    .some(wf => wf.category?.some((c: any) => c.value === 'RATING'));

  return !ratingApprovedAfter;
}
