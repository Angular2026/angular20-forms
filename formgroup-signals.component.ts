private readonly lboErrors: SubsidiaryValidationErrors[] = [
  'CRF_FLAGGED_LBO',
  'RMPM_FLAGGED_LBO',
];

private prefixLboError(alertTextId: SubsidiaryValidationErrors): string {
  return this.lboErrors.includes(alertTextId) ? `SUBS_${alertTextId}` : alertTextId;
}
