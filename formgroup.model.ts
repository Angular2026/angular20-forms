public CounterpartyDefaultStatus getDefaultStatus(String rmpmid) {
    CounterParty counterParty = repository.findByRmpmId(rmpmid);

    Optional<DefaultingClient> lastApprovedDefaultingClient =
            defaultRepository.findLatestApprovedByRmpmId(rmpmid);

    if (lastApprovedDefaultingClient.isEmpty()) {
        // No approved Default WF => no back-to-performing possible
        return CounterpartyDefaultStatus.of(
                counterParty.getCharacteristics().getRating(),
                null,   // keep whatever committeeDecisionDate value you pass today
                false);
    }

    DefaultingClient defaultingClient = lastApprovedDefaultingClient.get();

    String ratingToUse = resolveRatingToUse(counterParty, defaultingClient);
    boolean backToPerforming = isEligibleToBackToPerforming(defaultingClient);

    return CounterpartyDefaultStatus.of(
            ratingToUse,
            defaultingClient.getCommitteeDecisionDate(),
            backToPerforming);
}

/**
 * If the RMPM rating hasn't changed since the committee decision,
 * the counterparty rating is still the one set by the Default WF.
 * Otherwise, use the default rating stored on the WF.
 */
private String resolveRatingToUse(CounterParty counterParty, DefaultingClient defaultingClient) {
    LocalDate rmpmRatingDate = counterParty.getCharacteristics().getRatingDate();
    LocalDate committeeDecisionDate = defaultingClient.getCommitteeDecisionDate();

    return (rmpmRatingDate != null && rmpmRatingDate.equals(committeeDecisionDate))
            ? counterParty.getCharacteristics().getRating()
            : defaultingClient.getDefaultCounterpartyRating();
}

/**
 * BR: eligible if "Counterparty is back to performing" = Yes
 * on the last approved Default WF. Unknown (null) => not eligible.
 */
private boolean isEligibleToBackToPerforming(DefaultingClient defaultingClient) {
    BackToPerforming btp = defaultingClient.getBackToPerforming();
    return btp != null && btp.isEligible(LocalDate.now());
}
