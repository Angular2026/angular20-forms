copyCounterPartyRating(forceOverwrite = false) {
  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.approvedCounterpartyRating');
  
  if (!forceOverwrite && control?.value) {
    control.reset(); // AC#5 : toggle → efface si déjà rempli
  } else {
    control?.setValue(this.proposedCounterpartyRating()); // AC#2 : copie
  }
}

copyIntrinsicRating(forceOverwrite = false) {
  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.modelSpecificOverrides.approvedIntrinsicRatingCode');
  
  if (!forceOverwrite && control?.value) {
    control.reset();
  } else {
    control?.setValue(this.proposedIntrinsicRating());
  }
}

copyRatingSuGrr(forceOverwrite = false) {
  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.modelSpecificOverrides.approvedSuGrrPercentage');
  
  if (!forceOverwrite && control?.value) {
    control.reset();
  } else {
    control?.setValue(this.sugrrProposed());
  }
}

copyLbo(forceOverwrite = false) {
  if (this.proposedLbo() === undefined) return;

  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.approvedLboFlag');
  const currentValue = control?.value;

  if (!forceOverwrite && currentValue !== null && currentValue !== undefined) {
    control?.reset();
  } else {
    control?.setValue(this.proposedLbo() === 'YES');
  }
}






copyOrRemoveAll() {
  if (this.copyAllRemoveAllButtonLabel === $localize`:@@copyAllLabel:`) {
    this.copyCounterPartyRating(true); // force overwrite
    this.copyIntrinsicRating(true);
    this.copyRatingSuGrr(true);
    this.copyLbo(true);
    this.copyAllRemoveAllButtonLabel = $localize`:@@removeAllLabel:`;
  } else if (this.copyAllRemoveAllButtonLabel === $localize`:@@removeAllLabel:`) {
    this.ccDecisionsForm().get('ratingCcDecision')?.reset();
    this.ccDecisionsForm().get('ratingCcDecision.modelSpecificOverrides')?.reset();
    this.ccDecisionsForm().get('ratingCcDecision')?.updateValueAndValidity();
    this.triggerNextRatingDateComputation();
    this.copyAllRemoveAllButtonLabel = $localize`:@@copyAllLabel:`;
  }
}
