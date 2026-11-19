export enum GrrRatingPolicy {
  LGD_LARGE_CORPORATES = 'LGD Large Corporates',
  LGD_ASSET_FINANCE = 'LGD Asset Finance',
  LGD_PROJECT_FINANCE = 'LGD Project Finance',
  GLOBAL_NON_RETAIL_RATING = 'GLOBAL NON RETAIL RATING POLICY',
}

export const DEFAULT_GRR_POLICY_BY_MODEL: Partial<Record<RatingModelCode, GrrRatingPolicy>> = {
  [RatingModelCode.PD_LARGE_CORPORATE]: GrrRatingPolicy.LGD_LARGE_CORPORATES,
  [RatingModelCode.PD_ASSET_FINANCE]: GrrRatingPolicy.LGD_ASSET_FINANCE,
  [RatingModelCode.PD_PROJECT_FINANCE]: GrrRatingPolicy.LGD_PROJECT_FINANCE,
  [RatingModelCode.GLOBAL_NON_RETAIL_RATING]: GrrRatingPolicy.GLOBAL_NON_RETAIL_RATING,
};

// Map inverse déduite : plus besoin de GRR_POLICY_TO_RATING_MODEL écrit à la main
const GRR_POLICY_TO_RATING_MODEL: Record<string, RatingModelCode> = Object.fromEntries(
  Object.entries(DEFAULT_GRR_POLICY_BY_MODEL).map(([model, policy]) => [policy!.toUpperCase(), model as RatingModelCode]),
);

export const getRatingModelFromGrrPolicy = (policy?: string | null): RatingModelCode | null =>
  policy ? GRR_POLICY_TO_RATING_MODEL[policy.trim().toUpperCase()] ?? null : null;

private setModel(model: RatingModelCode): void {
  this.modelUsed = RatingModelDescription[model];
  this.specificRatingPolicy = RatingModelDescription[model];
  this.defaultGrrRatingPolicy = DEFAULT_GRR_POLICY_BY_MODEL[model] ?? '';
  this.facilityGrrForm().get('borrower.grrRatingPolicy')?.patchValue(this.defaultGrrRatingPolicy);
}

if (this.isPgnnr()) {
  this.setModel(RatingModelCode.GLOBAL_NON_RETAIL_RATING);
  this.applyPgnnrBorrowerRules();
} else if (this.isProjectFinance()) {
  this.clearPgnnrRules();
  this.setModel(RatingModelCode.PD_PROJECT_FINANCE);
  this.applyProjectFinanceBorrowerRules();
} else {
  this.clearPgnnrRules();
  this.setModel(RatingModelCode.PD_LARGE_CORPORATE);
  // ... obligorType, isHoldingSubordinate, loadLboFlag, displayErrorMessage
}



