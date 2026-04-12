readonly hasBr05Error = computed(() => {
  const isAutoFill = this.isRatingProposedAutoFill();
  const comment = (this.commentCtrl().value ?? '').trim();
  const ratingProposed = this.ratingProposedCtrl().value;

  return !!ratingProposed && !isAutoFill && !comment;
});

readonly counterpartyRatingValidatorEffect = effect(() => {
  const ratingCtrl = this.ratingProposedCtrl();
  const hasError = this.hasBr05Error();

  const errors = ratingCtrl.errors ?? {};

  if (hasError) {
    ratingCtrl.setErrors({
      ...errors,
      counterpartyRatingCommentRequired: true,
    });
  } else {
    if (errors['counterpartyRatingCommentRequired']) {
      const { counterpartyRatingCommentRequired, ...rest } = errors;
      ratingCtrl.setErrors(Object.keys(rest).length ? rest : null);
    }
  }
});

readonly hasBr06Warning = computed(() => {
  const ratingProposed = this.ratingProposedCtrl().value;
  const comment = (this.commentCtrl().value ?? '').trim();

  return !!ratingProposed && !this.isRatingProposedAutoFill() && !!comment;
});

readonly counterpartyRatingWarningEffect = effect(() => {
  const validationTriggered = this.validationInProgress();

  if (!validationTriggered) {
    this.clearCounterpartyRatingWarnings();
    return;
  }

  this.clearCounterpartyRatingWarnings();
  this.updateCounterpartyRatingWarnings();
});

private updateCounterpartyRatingWarnings(): void {
  const alerts: IAlert[] = [];

  if (this.hasBr06Warning()) {
    alerts.push({
      alertTextId: '@@counterpartyRatingConsistencyWarningTopPage',
      fragmentId: 'pgnnrCounterpartyRating',
      anchorId: 'counterpartyRatingProposed',
    });
  }

  if (alerts.length) {
    this.workflowValidationService.addWorkflowAlerts('warnings', alerts);
  }
}

private clearCounterpartyRatingWarnings(): void {
  this.workflowValidationService.clearAlertsByFragmentId(
    'warnings',
    'pgnnrCounterpartyRating',
  );
}
