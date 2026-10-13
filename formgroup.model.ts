// TODO REMOVE - debug BTP detail
Optional<DefaultingClient> rawBtpWf = defaultRepository.findLatestApprovedBackToPerformingByRmpmId(rmpmid);
log.info("[BTP] raw BTP WF present={}", rawBtpWf.isPresent());
rawBtpWf.ifPresent(dc -> log.info("[BTP] raw dc id={}, process={}, btpNull={}",
        dc.getId(), dc.getDefaultingProcess(), dc.getBackToPerforming() == null));
rawBtpWf.map(DefaultingClient::getBackToPerforming).ifPresent(b -> log.info(
        "[BTP] raw btp approved={}, approvalDate={}, btpYes={}, committeeDecisionDate={}",
        b.isApproved(), b.getApprovalDate(), b.getCounterpartyBackToPerforming(), committeeDecisionDate));



// TODO REMOVE - debug
log.info("[BTP] lastApprovedBtp present={}", lastApprovedBtp.isPresent());
lastApprovedBtp.ifPresent(b -> log.info("[BTP] btpYes={}, approved={}, approvalDate={}",
        b.getCounterpartyBackToPerforming(), b.isApproved(), b.getApprovalDate()));
workflowDocumentRepository.findLastApprovedRatingWorkflowByRmpmID(rmpmid)
        .ifPresentOrElse(
            wd -> log.info("[BTP] last approved rating WF id={}, created={}", wd.getId(), wd.getCreatedTimestamp()),
            () -> log.info("[BTP] no approved rating WF found"));
log.info("[BTP] current rating={}, ratingDate={}, committeeDecisionDate={}",
        counterParty.getCharacteristics().getRating(),
        counterParty.getCharacteristics().getRatingDate(),
        committeeDecisionDate);




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
