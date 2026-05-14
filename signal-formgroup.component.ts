// Sponsor Turnover Closing Date
const turnoverDateValidators = isCorporate
  ? [maxMonthsOldValidator('closingDate21Months', 21), ...(hasTurnover ? [Validators.required] : [])]
  : [];
c.sponsorTurnoverClosingDate.setValidators(turnoverDateValidators);
c.sponsorTurnoverClosingDate.updateValueAndValidity({ emitEvent: false });

// Adjusted Turnover Closing Date
const adjustedDateValidators = isCorporate
  ? [maxMonthsOldValidator('closingDate21Months', 21), ...(hasAdjusted ? [Validators.required] : [])]
  : [];
c.adjustedSponsorTurnoverClosingDate.setValidators(adjustedDateValidators);
c.adjustedSponsorTurnoverClosingDate.updateValueAndValidity({ emitEvent: false });

// AUM Closing Date
const aumDateValidators = isOther
  ? [maxMonthsOldValidator('closingDate21Months', 21), ...(hasAUM ? [Validators.required] : [])]
  : [];
c.assetsUnderManagementClosingDate.setValidators(aumDateValidators);
c.assetsUnderManagementClosingDate.updateValueAndValidity({ emitEvent: false });
