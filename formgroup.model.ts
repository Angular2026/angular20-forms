private boolean isEligibleToBackToPerforming(DefaultingClient defaultingClient) {
    BackToPerforming btp = defaultingClient.getBackToPerforming();
    if (btp == null) {
        return false;
    }

    // Same computation as the "Counterparty is back to performing" field in the Default WF
    Boolean probationPeriodIsOver = defaultDomainService.isProbationPeriodOver(
            btp.getProbationStartDate(),
            defaultingClient.getCommitteeDecisionDate());

    Boolean curePeriodIsOver = defaultDomainService.isCurePeriodOver(
            btp.getApprovedLastForbearanceDate(),
            btp.getApprovedDateEntryToDefault(),
            btp.getEndOfGracePeriod());

    Boolean backToPerforming = defaultDomainService.isCounterpartyBackToPerforming(
            btp.getMeetExitCriteria(),
            probationPeriodIsOver,
            curePeriodIsOver);

    return Boolean.TRUE.equals(backToPerforming); // null (unknown) => not eligible
}
