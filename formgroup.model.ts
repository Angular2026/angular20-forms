private updateCriteriaWarnings(): void {
  this.alertsBoxService.clearAlertsByFragmentId('warnings', 'criteria');

  const raw = this.ratingForm.getRawValue();
  const hasMissingCriteriaField = raw.criteria.some(
    (criterion: { grade: Grade | null; weight: Weight | null }) =>
      !hasValue(criterion.grade) || !hasValue(criterion.weight)
  );

  if (hasMissingCriteriaField) {
    this.alertsBoxService.addAlerts('warnings', [
      {
        alertTextId: CRITERIA_ALERT_KEYS.gradeOrWeightRequired,
        fragmentId: 'criteria',
        anchorId: 'criteria', // ou l'id du premier champ manquant, à voir plus bas
      },
    ]);
  }
}
