const FRB_AUTHORIZED_MODEL_PREFIXES: string[] = [
  'PLACM',
  'PLACH',
  'PASFM',
  'PASFH',
  'PPRFM',
  'PPRFH',
  'PGALM',
  'PSOVD',
];
const FRB_AUTHORIZED_EXACT_VALUES: string[] = ['SAVE'];


private isSrpAuthorizedForFrb(srp: string): boolean {
  if (!srp) {
    return true; // pas de valeur = rien à bloquer, laisse Validators.required gérer ça
  }
  return (
    FRB_AUTHORIZED_EXACT_VALUES.includes(srp) ||
    FRB_AUTHORIZED_MODEL_PREFIXES.some(prefix => srp.startsWith(prefix))
  );
}

checkFrbSrpAuthorization(): void {
  if (this.ratingPolicySelectionDetails?.frbRatingPerimeter !== 'Y') {
    return;
  }

  const srpControl = this.ratingPolicySelectionForm.get('currentSrpUsed');
  const srpValue = srpControl?.value;

  if (!this.isSrpAuthorizedForFrb(srpValue)) {
    srpControl.setErrors({ notAuthorizedFrbSrp: true });
    this.alertsBoxService.addAlerts('errors', [
      {
        alertTextId: 'notAuthorizedFrbSrp',
        fragmentId: 'currentSrpUsed',
        anchorId: 'currentSrpUsed',
      },
    ]);
  }
}


initRatingPolicySelectionForm() {
  this.addCurrentSRPControl();
  if (this.ratingPolicySelectionDetails?.currentSrpUsed) {
    this.changeRatingPolicy(...);
  }
  this.checkFrbSrpAuthorization(); // ← ajout
  // ... reste inchangé
}


"notAuthorizedFrbSrp@@notAuthorizedFrbSrpLabel": "This counterparty belongs to FRB rating perimeter and the selected SRP is not authorized. Please make sure that this counterparty data is up-to-date on FRB side system (for example Turnover, LBO financing identification) or select another SRP."
