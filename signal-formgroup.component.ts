public SRPDecisionTreeArchive(SRPDecisionTree srpDecisionTree) {
    this.questions = nonNull(srpDecisionTree) ? srpDecisionTree.getQuestions() : null;

    String srp;
    if (nonNull(srpDecisionTree)) {
        if (!nonNull(srpDecisionTree.getSrpResponseCombination())) {
            srp = srpDecisionTree.getWorkflowDocument().getCounterPartyRating().getXxx();
        } else {
            srp = srpDecisionTree.getSrpResponseCombination().getRecommendedSRP().getXxx();
        }
    } else {
        srp = null;
    }

    this.recommendedSRP = srp;
}
