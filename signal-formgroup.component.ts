copyCounterPartyRating(forceOverwrite = false) {
  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.approvedCounterpartyRating');

  if (forceOverwrite) {
    control?.setValue(this.proposedCounterpartyRating());
  } else {
    if (control?.value !== this.proposedCounterpartyRating()?.toLocaleUpperCase()) {
      control?.setValue(this.proposedCounterpartyRating());
    } else {
      control?.reset();
    }
  }
}

copyIntrinsicRating(forceOverwrite = false) {
  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.modelSpecificOverrides.approvedIntrinsicRatingCode');

  if (forceOverwrite) {
    control?.setValue(this.proposedIntrinsicRating());
  } else {
    if (control?.value !== this.proposedIntrinsicRating()?.toLocaleUpperCase()) {
      control?.setValue(this.proposedIntrinsicRating());
    } else {
      control?.reset();
    }
  }
}

copyRatingSuGrr(forceOverwrite = false) {
  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.modelSpecificOverrides.approvedSuGrrPercentage');

  if (forceOverwrite) {
    control?.setValue(this.sugrrProposed());
  } else {
    if (control?.value !== this.sugrrProposed()) {
      control?.setValue(this.sugrrProposed());
    } else {
      control?.reset();
    }
  }
}

copyLbo(forceOverwrite = false) {
  if (this.proposedLbo() === undefined) return;

  const control = this.ccDecisionsForm()
    ?.get('ratingCcDecision.approvedLboFlag');

  if (forceOverwrite) {
    control?.setValue(this.proposedLbo() === 'YES');
  } else {
    const currentValue = control?.value;
    const expectedValue = this.proposedLbo() === 'YES';
    if (currentValue === null || currentValue === undefined) {
      control?.setValue(expectedValue);
    } else {
      control?.reset();
    }
  }
}

copyOrRemoveAll() {
  if (this.copyAllRemoveAllButtonLabel === $localize`:@@copyAllLabel:`) {
    this.copyCounterPartyRating(true);
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
