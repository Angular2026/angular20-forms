export function isOlderThanMonths(date: unknown, months = 21): boolean {
  if (!date) return false;
  const d = new Date(date as string);
  if (isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return d < cutoff;
}


private updateDateWarning(): void {
  const c = this.externalSponsorForm.controls;

  // AVANT : filter sur errors?.['closingDate21Months']  ← plus de validator
  // APRÈS : filter sur la valeur de la date directement
  const alerts: IAlert[] = this.DATE_WARNING_CONTROLS
    .filter(name => this.isOlderThan21Months(c[name]?.value))
    .map(name => ({
      alertTextId: PROJECT_FINANCE_ALERT_KEYS.closingDate21MonthsWarning,
      fragmentId:  'counterpartyRating',
      anchorId:    name,
    }));

  this.workflowValidationService.addWorkflowAlerts('warnings', alerts);
}


readonly hasDateWarning = computed(() => {
  this.formValue(); // dépendance signal pour re-trigger sur changement
  const c = this.externalSponsorForm.controls;
  return this.DATE_WARNING_CONTROLS.some(
    name => this.isOlderThan21Months(c[name]?.value)
  );
});
