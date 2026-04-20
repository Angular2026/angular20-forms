// BR05 / BR06 + AC#8 -> AC#33
readonly ratingConsistencyResult = computed<RatingValidationResult>(() => {
  const supportDirection = this.supportDirectionValue();
  const supportStrength  = this.supportStrengthValue();
  const hasComment       = this.hasComment();

  const fail = (): RatingValidationResult => ({
    severity: hasComment ? 'warning' : 'error',
    target: 'rating',
    code: 'supportConsistency',
  });
  const ok: RatingValidationResult = { severity: 'none' }; // à adapter à ton type

  // CR = IR  ⇔  ni meilleur ni pire
  const isCrEqualIr = !this.isCrBetterThanIr() && !this.isCrWorseThanIr();

  // ========= Support Direction = NEGATIVE =========
  if (supportDirection === 'NEGATIVE') {
    if (supportStrength === 'WEAK') {
      return isCrEqualIr ? ok : fail();                 // CR = IR
    }
    if (supportStrength === 'STRONG' || supportStrength === 'VERY_STRONG') {
      return this.isCrWorseThanIr() ? ok : fail();      // CR worse than IR
    }
  }

  // ========= Support Direction = POSITIVE =========
  if (supportDirection === 'POSITIVE') {
    if (supportStrength === 'UNDETERMINED' || supportStrength === 'WEAK') {
      return isCrEqualIr ? ok : fail();                 // CR = IR
    }

    if (supportStrength === 'STRONG') {
      // pré-requis : CR(Support) > IR
      if (!this.isCrSupportBetterThanIr()) return fail();

      if (this.isCrSupportBetterThanMrc()) {
        // CR ∈ [IR, MRC]
        return this.isCrBetweenIrAndMrc() ? ok : fail();
      }
      // CR ∈ [IR, CR(Support)]
      return this.isCrBetweenIrAndCrSupport() ? ok : fail();
    }

    if (supportStrength === 'VERY_STRONG') {
      if (!this.isCrSupportBetterThanIr()) return fail();

      if (this.isCrSupportBetterThanMrc()) {
        // CR ∈ [IR, CR(Support)]  ET  CR < geometric_mean(IR, CR(Support))
        return this.isCrBetweenIrAndCrSupport() && this.isCrBelowGeometricMean()
          ? ok
          : fail();
      }
      // CR ∈ [IR, CR(Support)]
      return this.isCrBetweenIrAndCrSupport() ? ok : fail();
    }

    if (supportStrength === 'ABSOLUTE') {
      return ok; // CR peut prendre n'importe quelle valeur
    }
  }

  return ok;
});
