export const PROJECT_FINANCE_ALERT_KEYS = {
  closingDate21MonthsWarning: $localize`:@@closingDate21MonthsWarning:La date d'arrêté saisie dépasse 21 mois - Merci de noter que dans ce cas la pire modalité sera appliquée pour le calcul de la PD.`,
};

private readonly DATE_WARNING_CONTROLS = [
  'sponsorTurnoverClosingDate',
  'adjustedSponsorTurnoverClosingDate',
  'assetsUnderManagementClosingDate',
] as const;


readonly hasDateWarning = computed(() => {
  this.formValue(); // dépendance pour relancer le computed sur value changes
  const c = this.externalSponsorForm.controls;
  return this.DATE_WARNING_CONTROLS.some(
    name => !!c[name]?.errors?.['closingDate21Months'],
  );
});

readonly dateWarningEffect = effect(() => {
  this.hasDateWarning(); // dépendance signal
  this.updateDateWarning();
});

private updateDateWarning(): void {
  const c = this.externalSponsorForm.controls;

  const alerts: IAlert[] = this.DATE_WARNING_CONTROLS
    .filter(name => !!c[name]?.errors?.['closingDate21Months'])
    .map(name => ({
      alertTextId: PROJECT_FINANCE_ALERT_KEYS.closingDate21MonthsWarning,
      fragmentId: 'sponsorEntity',
      anchorId: name,
    }));

  this.workflowValidationService.addWorkflowAlerts('warnings', alerts);
}
