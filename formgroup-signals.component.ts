CrfRatingResultsDTO ctrMock = new CrfRatingResultsDTO();
ctrMock.setFullModelProbabilityOfDefault(BigDecimal.valueOf(0.0200));
ctrMock.setFullModelRating("2+");
ctrMock.setFullModelRatingDate(LocalDate.parse("2026-05-28"));
ctrMock.setIsMRCCapApplied(false);

UpwardAndDownwardOverrideResultsDTO overrideMock = new UpwardAndDownwardOverrideResultsDTO();
overrideMock.setUpwardOverride(List.of("1"));
overrideMock.setDownwardOverride(List.of("3-", "4-", "5"));

RatingResultsWithOverrideFields mock = new RatingResultsWithOverrideFields();
mock.setCrfRatingResults(ctrMock);
mock.setUpwardAndDownwardOverrideResultsDTO(overrideMock);

return mock;


