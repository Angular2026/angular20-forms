console.log('[BR06]', {
  selected: this.selectedCategoryValue,
  defaultStates: defaultDocs.map(d => d.currentState),
  deferralStates: deferralDocs.map(d => d.currentState),
  DEFAULT_CLOSED_STATES: this.DEFAULT_CLOSED_STATES,
  allDefaultWorkflowsAreClosed,
  allDeferralWorkflowsAreClosed,
});
