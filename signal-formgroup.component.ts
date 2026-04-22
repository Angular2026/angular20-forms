copyOrRemoveAll() {
  if (this.copyAllRemoveAllButtonLabel === $localize`:@@copyAllLabel:`) {
    this.copyCounterPartyRating(true);
    this.copyIntrinsicRating(true);
    this.copyRatingSuGrr(true);
    this.copyLbo(true);
    this.copyAllRemoveAllButtonLabel = $localize`:@@removeAllLabel:`;

  } else if (this.copyAllRemoveAllButtonLabel === $localize`:@@removeAllLabel:`) {
    // ❌ Remplacer reset() global qui causait l'erreur et ne vidait pas tout
    // ✅ setValue(null) individuel sur chaque champ approuvé
    this.ccDecisionsForm()
      ?.get('ratingCcDecision.approvedCounterpartyRating')
      ?.setValue(null);

    this.ccDecisionsForm()
      ?.get('ratingCcDecision.modelSpecificOverrides.approvedIntrinsicRatingCode')
      ?.setValue(null);

    this.ccDecisionsForm()
      ?.get('ratingCcDecision.modelSpecificOverrides.approvedSuGrrPercentage')
      ?.setValue(null);

    this.ccDecisionsForm()
      ?.get('ratingCcDecision.approvedLboFlag')
      ?.setValue(null);

    this.ccDecisionsForm()
      ?.get('ratingCcDecision')
      ?.updateValueAndValidity();

    this.triggerNextRatingDateComputation();
    this.copyAllRemoveAllButtonLabel = $localize`:@@copyAllLabel:`;
  }
}
