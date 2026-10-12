if (isEligibleToBackToPerforming(defaultingClient)) {
    Optional<WorkflowDocument> ratingApprovedAfterBtp =
            findRatingApprovedAfter(rmpmid, committeeDecisionDate);

    if (ratingApprovedAfterBtp.isPresent()) {
        // BTP finalized by a new approved rating => the new rating decides
        String newRating = ratingApprovedAfterBtp.get().getCounterPartyRating().getRating(); // getter à adapter
        return CounterpartyDefaultStatus.of(newRating, committeeDecisionDate, false);
    }
    // BTP = Yes, waiting for a new rating WF => stays in default, banner displayed
    return CounterpartyDefaultStatus.of(
            defaultingClient.getDefaultCounterpartyRating(), committeeDecisionDate, true);
}


private Optional<WorkflowDocument> findRatingApprovedAfter(String rmpmid, LocalDate committeeDecisionDate) {
    if (committeeDecisionDate == null) {
        return Optional.empty();
    }
    return workflowDocumentRepository.findLastApprovedRatingWorkflowByRmpmID(rmpmid)
            .filter(doc -> !doc.getCreatedTimestamp().toLocalDate()   // getter à adapter
                    .isBefore(committeeDecisionDate));
}
