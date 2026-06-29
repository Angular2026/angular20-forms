// Constantes à adapter selon tes valeurs réelles
const SU_GRR_NOT_SECURED_VALUE = 0.6;   // 60%
const SU_GRR_SPV_PLEDGED_VALUE = 0;     // 0%

getSuGrrHlcListForAssetFinance(
  assetPledge: boolean | null,
  suGrrComputed: number,
  fullList: ISelectOption[] // [HLC1, HLC2, HLC3, 60%, 0%]
): ISelectOption[] {

  // Cas NA : foundation déjà à 60%, pas de notion de pledge -> liste verrouillée à 60 seul
  if (assetPledge === null && suGrrComputed === SU_GRR_NOT_SECURED_VALUE) {
    return fullList.filter(item => item.value === SU_GRR_NOT_SECURED_VALUE);
  }

  // Cas Asset Pledge = Yes, baseline = 0% -> liste complète (60, HLC1, HLC2, HLC3, 0)
  if (assetPledge === true && suGrrComputed === SU_GRR_SPV_PLEDGED_VALUE) {
    return fullList;
  }

  // Cas Asset Pledge = No, baseline = 60% -> liste sans l'option "0% pledged"
  if (assetPledge === false && suGrrComputed === SU_GRR_NOT_SECURED_VALUE) {
    return fullList.filter(item => item.value !== SU_GRR_SPV_PLEDGED_VALUE);
  }

  return fullList; // fallback de sécurité
}


getSuGrrBaselineForAssetFinance(assetPledge: boolean | null): number {
  if (assetPledge === true) return SU_GRR_SPV_PLEDGED_VALUE; // 0
  return SU_GRR_NOT_SECURED_VALUE; // 60, pour No et NA
}

get showSuGrrToken() {
  return (
    this.suGrrOverrideValidationStatus === SuGrrOverrideValidationStatus.VALIDATION_IS_NOT_REQUIRED ||
    this.suGrrOverrideValidationStatus === SuGrrOverrideValidationStatus.VALIDATION_IS_REQUIRED ||
    (this.modelUsed() === EModelCode.PD_PROJECT_FINANCE &&
      this.ccDecisionsForm().get('ratingCcDecision.approvedSuGrr')?.value != this.proposedRatingSuGrr?.value) ||
    (this.modelUsed() === EModelCode.PD_ASSET_FINANCE &&
      this.ccDecisionsForm().get('ratingCcDecision.approvedSuGrr')?.value !=
        this.getSuGrrBaselineForAssetFinance(this.assetPledge()))
  );
}

getHlcList(suGrrHlcList: IItemList[], suGrrValue?: number): IItemList[] {
  const suGRRhlc3Value = suGrrHlcList.find(hlc => hlc.label.includes('HLC 3'))?.value;

  if (this.modelUsed() === EModelCode.PD_PROJECT_FINANCE) {
    if (suGrrValue === suGRRhlc3Value) {
      return suGrrHlcList.sort((obj1, obj2) => obj2.value - obj1.value).filter(item => item.value...);
    } else {
      return suGrrHlcList.sort((obj1, obj2) => obj2.value - obj1.value).filter(item => item.value...);
    }
  } else if (this.modelUsed() === EModelCode.PD_ASSET_FINANCE) {
    const assetPledge = this.workflowDTO()?.counterPartyRating?.suGrrRating?.assetPledge;
    return this.getSuGrrHlcListForAssetFinance(assetPledge, suGrrValue, suGrrHlcList);
  } else {
    return suGrrHlcList.sort((obj1, obj2) => obj2.value - obj1.value);
  }
}
