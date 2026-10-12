if (defaultRepository.isLastDecisionDeclinedBackToPerforming(rmpmid)) {
    return CounterpartyDefaultStatus.notInDefault();
}


private boolean isEligibleToBackToPerforming(DefaultingClient defaultingClient) {
    BackToPerforming btp = defaultingClient.getBackToPerforming();
    if (btp == null) {
        return false;
    }
    BackToPerformingExitCriteria exitCriteria =
            defaultDomainService.evaluateExitCriteria(btp, defaultingClient.getCommitteeDecisionDate());
    return Boolean.TRUE.equals(exitCriteria.getCounterpartyBackToPerforming()); // getter à ajuster
}


@Query("""
    select new com.bnpparibas.sit.fresh.rds.rds04.crf.back.infrastructure.workflow.defaultclient.DefaultWorkflowDecision(
        dc.defaultingProcess, wh.currentState)
    from WorkflowHistory wh
    join wh.workflow w
    join w.defaultingClient dc
    where dc.counterparty.characteristics.rmpmid = :rmpmId
      and w.categoryRaw = 'DEFAULT'
      and wh.currentState in ('APPROVED', 'DECLINED')
    order by wh.modifiedTimestamp desc
""")
List<DefaultWorkflowDecision> findDecisionsByRmpmId(@Param("rmpmId") String rmpmId, Pageable pageable);


boolean isLastDecisionDeclinedBackToPerforming(String rmpmId);

@Override
public boolean isLastDecisionDeclinedBackToPerforming(String rmpmId) {
    return defaultDao.findDecisionsByRmpmId(rmpmId, PageRequest.of(0, 1))
            .stream()
            .findFirst()
            .map(d -> d.process() == DefaultingProcessEnum.BACK_PERFORMING
                    && "DECLINED".equals(d.state()))
            .orElse(false);
}



// BR: back-to-performing WF declined => leaves default state
if (defaultRepository.isLastDecisionDeclinedBackToPerforming(rmpmid)) {
    return CounterpartyDefaultStatus.notInDefault();
}
public record DefaultWorkflowDecision(DefaultingProcessEnum process, String state) {}



