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
