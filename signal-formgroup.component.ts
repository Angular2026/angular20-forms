private currentBranch(): 'NONE' | 'DEFAULT_REVIEW' | 'BACK_PERFORMING' {
  // canDefault === false -> comportement historique, identique a DEFAULT_REVIEW
  if (!this.canDefault()) return 'DEFAULT_REVIEW';

  if (this.savedIsDefault() === true) return 'DEFAULT_REVIEW';
  if (this.savedIsDefault() === false) return 'BACK_PERFORMING';

  // rien de sauvegarde, mais des donnees de revue existent deja (lignes anterieures
  // a la colonne is_default) -> on reste sur l'ancien comportement
  if (this.hasExistingReviewData()) return 'DEFAULT_REVIEW';

  return 'NONE';
}

private hasExistingReviewData(): boolean {
  const form = this.defaultClientForm();
  return !!form.get('decisionMakingCommittee')?.value
      || !!form.get('committeeDecisionDate')?.value
      || !!form.get('rating.counterPartyRating')?.value;
}

private applyRules(): void {
  const form = this.defaultClientForm();
  const branch = this.currentBranch();
  const committee = form.get('decisionMakingCommittee')?.value;
  const dateControl = form.get('committeeDecisionDate');

  const isReview = branch === 'DEFAULT_REVIEW';

  const needsDate = isReview && ['CREDIT_COMMITTEE', 'WATCHLIST_COMMITTEE', 'OTHER'].includes(committee);
  const needsComment = isReview && committee === 'OTHER';
  const needsRating = needsDate && !!dateControl?.value && !dateControl?.errors;

  this.showDefaultingProcess = this.canDefault();
  this.showBackToPerforming = branch === 'BACK_PERFORMING';
  this.showDecisionMakingCommittee = isReview;
  this.showCommitteeRatingDecisionDate = needsDate;
  this.showCommentAuthorityField = needsComment;

  this.setRequired(form.get('defaultingProcess'), this.canDefault());
  this.setRequired(form.get('decisionMakingCommittee'), isReview);
  this.setRequired(dateControl, needsDate);
  this.setRequired(form.get('commentAuthority'), needsComment);
  this.setRequired(form.get('rating.counterPartyRating'), needsRating);

  this.counterpartyRatingVisible.emit(needsRating);
}

