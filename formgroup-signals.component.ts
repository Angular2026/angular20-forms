 private initializeFromCurrentSubsidiary(): void {
    const subsidiary = this.currentSubsidiary();
    if (!subsidiary) return;
 
    for (const field of this.fields) {
      const value = (subsidiary as any)[field];
 
      // Pas de valeur → on s'arrête : les champs suivants restent cachés
      if (value === null || value === undefined) break;
 
      const control = this.inheritanceForm()?.get(`subsidiary.${field}`);
      if (!control) break;
 
      // Patch silencieux de la valeur
      control.patchValue(value, { emitEvent: false });
      control.markAsPristine();
 
      if (value === false) {
        // ── "No" sauvegardé : restaure l'alerte et le validator d'erreur ────
        this.workFlowValidationService.addWorkflowAlerts('errors', [
          {
            alertTextId: field + 'Error',
            anchorId: field,
            fragmentId: 'counterpartyRating',
          },
        ]);
 
        control.clearValidators();
        control.addValidators([
          this.requiredIfNoSelection,
          () => ({ [`${field}Error`]: true }),
        ]);
        control.updateValueAndValidity({ emitEvent: false });
        break; // Les champs suivants ne s'affichent pas après un "No"
 
      } else {
        // ── "Yes" sauvegardé : garde required, active le champ suivant ──────
        control.clearValidators();
        control.addValidators([this.requiredIfNoSelection]);
        control.setErrors(null);
        control.updateValueAndValidity({ emitEvent: false });
 
        this.activateRequiredOnNextField(field);
      }
    }
  }
