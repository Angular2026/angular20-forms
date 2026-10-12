public CounterpartyDefaultStatus getDefaultStatus(String rmpmid) {
    CounterParty counterParty = repository.findByRmpmId(rmpmid);

    Optional<DefaultingClient> lastApprovedDefaultingClient =
            defaultRepository.findLatestApprovedByRmpmId(rmpmid);

    if (lastApprovedDefaultingClient.isEmpty()) {
        return CounterpartyDefaultStatus.of(
                counterParty.getCharacteristics().getRating(), null, false);
    }

    DefaultingClient defaultingClient = lastApprovedDefaultingClient.get();
    LocalDate committeeDecisionDate = defaultingClient.getCommitteeDecisionDate();

    if (isEligibleToBackToPerforming(defaultingClient)) {
        if (isRatingApprovedAfter(counterParty, committeeDecisionDate)) {
            // BTP finalized by a new approved rating => the new rating decides
            return CounterpartyDefaultStatus.of(
                    counterParty.getCharacteristics().getRating(), committeeDecisionDate, false);
        }
        // BTP = Yes, waiting for a new rating WF => stays in default, banner displayed
        return CounterpartyDefaultStatus.of(
                defaultingClient.getDefaultCounterpartyRating(), committeeDecisionDate, true);
    }

    // Existing behaviour (no back-to-performing)
    return CounterpartyDefaultStatus.of(
            resolveRatingToUse(counterParty, defaultingClient), committeeDecisionDate, false);
}

private boolean isRatingApprovedAfter(CounterParty counterParty, LocalDate committeeDecisionDate) {
    LocalDate rmpmRatingDate = counterParty.getCharacteristics().getRatingDate();
    return rmpmRatingDate != null
            && committeeDecisionDate != null
            && rmpmRatingDate.isAfter(committeeDecisionDate);
}





@Query("""
    select dc.defaultingProcess as process, wh.currentState as state
    from DefaultingClient dc
    join WorkflowDocument w on w.defaultingClient = dc
    join WorkflowHistory wh on wh.workflow = w
    where dc.counterparty.characteristics.rmpmid = :rmpmId
      and w.categoryRaw = 'DEFAULT'
      and wh.currentState in ('APPROVED', 'DECLINED')
    order by wh.modifiedTimestamp desc
""")
List<DefaultWorkflowDecision> findDecisionsByRmpmId(@Param("rmpmId") String rmpmId, Pageable pageable);


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



