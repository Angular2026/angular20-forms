private updateCriteriaWarnings(): void {
  this.alertsBoxService.clearAlertsByFragmentId('warnings', 'criteria');

  const raw = this.ratingForm.getRawValue();
  const alerts: IAlert[] = [];

  raw.criteria.forEach((criterion: { grade: Grade | null; weight: Weight | null }, i: number) => {
    const label = this.criterionTitles[i];

    if (!hasValue(criterion.grade)) {
      alerts.push({
        alertTextId: CRITERIA_ALERT_KEYS.gradeRequired,
        fragmentId: 'criteria',
        anchorId: `criteria.${i}.grade`,
        alertText: `${label} : ${ALERTS_MESSAGES.gradeRequired}`,
      });
    }

    if (!hasValue(criterion.weight)) {
      alerts.push({
        alertTextId: CRITERIA_ALERT_KEYS.weightRequired,
        fragmentId: 'criteria',
        anchorId: `criteria.${i}.weight`,
        alertText: `${label} : ${ALERTS_MESSAGES.weightRequired}`,
      });
    }
  });

  if (alerts.length) {
    this.alertsBoxService.addAlerts('warnings', alerts);
  }
}

private clearCriteriaWarnings(): void {
  this.alertsBoxService.clearAlertsByFragmentId('warnings', 'criteria');
}

readonly warningEffect = effect(() => {
  const validationTriggered = this.validationInProgress();

  if (!validationTriggered) {
    this.clearWarnings();
    this.clearCriteriaWarnings();
  }

  this.updateAmortizingWarnings();
  this.updateCriteriaWarnings();
});
