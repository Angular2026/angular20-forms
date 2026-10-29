console.log('[BR06]', {
  selected: this.selectedCategoryValue,
  defaultStates: defaultDocs.map(d => d.currentState),
  deferralStates: deferralDocs.map(d => d.currentState),
  DEFAULT_CLOSED_STATES: this.DEFAULT_CLOSED_STATES,
  allDefaultWorkflowsAreClosed,
  allDeferralWorkflowsAreClosed,
});


console.log('[BR06] extra', {
  hasWriterOnRating: this.userRightsService.hasUserRight([this.userRight.WRITER_ON_RATING]),
  isCounterpartyInDefault: this.isCounterpartyInDefault,
  counterpartyBackToPerforming: this.counterpartyBackToPerforming,
  hasDefaultRestrictionError: this.hasDefaultRestrictionError,
});

console.log('[BR06] isEligible', isEligible);
