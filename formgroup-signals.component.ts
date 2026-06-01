public RatingResultsWithUpwardAndDownwardOverrideDTO computeRating(RatingDto request) {
    
    // MOCK TEMPORAIRE — à retirer
    CtrRatingResultsDTO ctrMock = new CtrRatingResultsDTO();
    ctrMock.setFullModelProbabilityOfDefault(2.69);
    ctrMock.setFullModelRating("7");
    ctrMock.setFullModelRatingDate("2026-06-01");
    ctrMock.setIsMRCCapApplied(false);

    UpwardAndDownwardOverrideResultsDTO overrideMock = new UpwardAndDownwardOverrideResultsDTO();
    overrideMock.setUpwardOverride(List.of("6+ (0,58%)", "6+ (0,81%)", "6-"));
    overrideMock.setDownwardOverride(List.of("7-", "8+", "8"));

    RatingResultsWithUpwardAndDownwardOverrideDTO mock = new RatingResultsWithUpwardAndDownwardOverrideDTO();
    mock.setCtrRatingResults(ctrMock);
    mock.setUpwardAndDownwardOverrideResultsDTO(overrideMock);

    return mock;
    // fin mock — vraie logique en dessous commentée
}
