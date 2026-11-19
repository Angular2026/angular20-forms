private applyProjectFinanceBorrowerRules(lockOverride = true): void {
  if (lockOverride) {
    // PF coming from the SRP: override not allowed → clear and lock
    const overrideCtrl = this.facilityGrrForm().get('borrower.overideGrrRatingPolicy');
    overrideCtrl?.reset(null, { emitEvent: false });
    overrideCtrl?.disable({ emitEvent: false });

    const commentCtrl = this.facilityGrrForm().get('borrower.comment');
    commentCtrl?.reset(null, { emitEvent: false });
    commentCtrl?.clearValidators();
    commentCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  // Common to both cases: PD LC fields are not used in PF
  this.nonPfBorrowerFields.forEach(name => {
    const ctrl = this.facilityGrrForm().get(`borrower.${name}`);
    ctrl?.clearValidators();
    ctrl?.reset(null, { emitEvent: false });
    ctrl?.updateValueAndValidity({ emitEvent: false });
  });
}

/** Re-enables the override dropdown (it may have been locked by a PF load) */
private unlockGrrOverride(): void {
  this.facilityGrrForm().get('borrower.overideGrrRatingPolicy')?.enable({ emitEvent: false });
}


case RatingModelCode.PD_PROJECT_FINANCE:
  this.clearPgnnrRules();
  this.applyProjectFinanceBorrowerRules(false);   // keeps the user's choice
  break;
