<!-- APRÈS -->
[selectionControl]="$any(eligibilityGroup()?.get('isTreasuryCenterOwnedByBusinessGroup'))"
(fieldValueChanged)="setSelection($event, 'isTreasuryCenterOwnedByBusinessGroup')"

@if (
  eligibilityGroup()?.get('isTreasuryCenterOwnedByBusinessGroup')?.errors?.['required']
)

@if (eligibilityGroup()?.get('isTreasuryCenterOwnedByBusinessGroup')?.value === false)

@if (eligibilityGroup()?.get('isTreasuryCenterOwnedByBusinessGroup')?.value)


 // Dans le composant .ts
protected readonly eligibilityGroup = computed(() =>
  this.inheritanceForm()?.get(
    this.currentTypeOfInheritance() ? 'treasuryCentre' : 'subsidiary'
  ) as FormGroup
);


private initializeFromCurrentSubsidiary(): void {
  const subsidiary = this.currentSubsidiary();
  if (!subsidiary) return;

  for (const field of this.fields) {
    const value = subsidiary.relationOverrides[field];
    if (value === null || value === undefined) break;

    const control = this.inheritanceForm()?.get(this.getControlPath(field));
    if (!control) break;

    control.patchValue(value, { emitEvent: false });
    control.markAsPristine();

    if (value === false) {
      this.workFlowValidationService.addWorkflowAlerts('errors', [{
        alertTextId: field + 'Error',
        anchorId: field,
        fragmentId: 'counterpartyRating',
      }]);
      control.clearValidators();
      control.addValidators([() => ({ [`${field}Error`]: true })]);
      control.updateValueAndValidity({ emitEvent: false });
      break;
    } else {
      this.activateRequiredOnNextField(field);
    }
  }
}



// AVANT
this.inheritanceForm()?.get(`subsidiary.${fieldName}`)
this.inheritanceForm()?.get('subsidiary') as FormGroup

// APRÈS
this.inheritanceForm()?.get(this.getControlPath(fieldName))
this.inheritanceForm()?.get(
  this.currentTypeOfInheritance() ? 'treasuryCentre' : 'subsidiary'
) as FormGroup


// ─── Input supplémentaire ───────────────────────────────────────────────────
currentTypeOfInheritance = input<boolean>();

// ─── Helper : retourne le bon chemin selon le parent ───────────────────────
private getControlPath(fieldName: string): string {
  return this.currentTypeOfInheritance()
    ? `treasuryCentre.${fieldName}`
    : `subsidiary.${fieldName}`;
}
