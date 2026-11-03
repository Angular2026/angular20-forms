private applyDefaultRestriction(): void {
  this.hasDefaultRestrictionError = false;
  if (!this.isCounterpartyInDefault) {
    return;
  }

  const selectedCategories: string[] = this.workflowForm.get('category')?.value ?? [];
  const restricted = ['RATING', 'DEFERRAL', 'FACILITY_GRR'];
  const isRatingOnly = selectedCategories.length === 1 && selectedCategories[0] === 'RATING';

  const blockingSelection = this.counterpartyBackToPerforming
    ? !isRatingOnly && selectedCategories.some(c => restricted.includes(c))
    : selectedCategories.some(c => restricted.includes(c));

  if (blockingSelection) {
    this.isNewWorkflowBtnDisabled = true;
    this.hasDefaultRestrictionError = true;
  }
}
