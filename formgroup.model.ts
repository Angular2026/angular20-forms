const GRR_POLICY_TO_RATING_MODEL: Record<string, RatingModelCode> = {
  'LGD LARGE CORPORATES': RatingModelCode.PD_LARGE_CORPORATE,
  'LGD ASSET FINANCE': RatingModelCode.PD_ASSET_FINANCE,
  'LGD PROJECT FINANCE': RatingModelCode.PD_PROJECT_FINANCE,
  'GLOBAL NON RETAIL RATING POLICY': RatingModelCode.GLOBAL_NON_RETAIL_RATING,
};

export function getRatingModelFromGrrPolicy(policy?: string | null): RatingModelCode | null {
  if (!policy) return null;
  return GRR_POLICY_TO_RATING_MODEL[policy.trim().toUpperCase()] ?? null;
}

export function getRatingDescriptionFromGrrPolicy(policy?: string | null): string | null {
  const code = getRatingModelFromGrrPolicy(policy);
  return code ? RatingModelDescription[code] : null;
}


private listenGrrPolicyChanges(): void {
  const b = this.facilityGrrForm().get('borrower');
  const effectivePolicy = () =>
    b.get('overideGrrRatingPolicy').value || b.get('grrRatingPolicy').value;

  merge(
    b.get('grrRatingPolicy').valueChanges,
    b.get('overideGrrRatingPolicy').valueChanges,
  ).pipe(
    startWith(null),
    map(() => getRatingModelFromGrrPolicy(effectivePolicy())),
    distinctUntilChanged(),
    takeUntilDestroyed(this.destroyRef),
  ).subscribe(code => this.applyRatingModel(code));
}



private applyRatingModel(code: RatingModelCode | null): void {
  switch (code) {
    case RatingModelCode.GLOBAL_NON_RETAIL_RATING: /* branche PGNNR */ break;
    case RatingModelCode.PD_PROJECT_FINANCE:       /* branche PF */    break;
    case RatingModelCode.PD_ASSET_FINANCE:         /* branche AF */    break;
    default:                                       /* branche PD LC */ break;
  }
}

