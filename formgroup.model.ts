fetchRatingPolicyDetails() {
  this.workflowService.fetchRatingPolicyDetails(fetchRatingPolicy).subscribe(details => {
    this.ratingPolicySelectionDetails = details;

    // snapshot indépendant, ne sera jamais nullifié par changeRatingPolicy()
    this.frbRatingPerimeter = details?.frbRatingPerimeter ?? null;
    this.frbModelCode = details?.frbModelCode ?? null;

    this.workflowService.refreshPropagationSchemesEligibleValue(this.ratingPolicySelectionDetails?.propagationSchemesEligible);
    this.workflowService.refreshSrpValue(details?.currentSrpUsed === 'PLACH' ? 'PLACM' : details?.currentSrpUsed);
    this.workflowService.updateInheritanceType(details?.typeOfInheritance);
    this.initRatingPolicySelectionForm();
  });
}

get shouldDeactivateSrpDecisionTree(): boolean {
  return this.frbRatingPerimeter === 'Y' && this.isSrpAuthorizedForFrb(this.frbModelCode);
}

private captureBaseFormControlNames(): void {
  this.baseFormControlNames = Object.keys(this.ratingPolicySelectionForm.controls);
}

initRatingPolicySelectionForm() {
  this.addCurrentSRPControl();
  this.captureBaseFormControlNames(); // ← ici

  if (this.ratingPolicySelectionDetails?.currentSrpUsed) {
    this.changeRatingPolicy(...);
  }
  // ... reste inchangé
}

changeRatingPolicy(policy) {
  this.resetRatingPolicySelectionFormm(policy);
  this.captureBaseFormControlNames(); // ← form reconstruit dans resetRatingPolicySelectionFormm, donc snapshot après
  this.triggerRatingPolicyModelChanged(policy);

  if (this.registry.find(model => model.modelCode === this.modelType)) {
    this.handleLoadingSRPSummaryComponent();
  } else {
    if (!this.isRecommendedSRPValidated(policy)) {
      this.ratingPolicySelectionForm = this.formBuilder.group({
        currentSrpUsed: [policy, Validators.required],
        srpOverrideComments: [null, Validators.compose([Validators.required, Validators.maxLength(this.maxChars())])],
      });
      this.captureBaseFormControlNames(); // ← re-snapshot, ce form a srpOverrideComments "de base"
    }
    this.container.clear();
    this.ratingPolicySelectionDetails = null;
    // ⚠️ ne PAS remettre frbRatingPerimeter / frbModelCode à null ici
  }

  this.checkFrbSrpAuthorization();
}


// mock/frb-mock.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface IFrbMockData {
  frbRatingPerimeter: string; // 'Y' | 'N'
  frbModelCode: string;
}

@Injectable({ providedIn: 'root' })
export class FrbMockService {
  // 🔧 change ces valeurs pour tester les différents cas BR02/BR03/BR04
  private readonly mockData: IFrbMockData = {
    frbRatingPerimeter: 'Y',
    frbModelCode: 'PLACM010', // change en 'XXXXX' pour tester BR04 (non autorisé)
  };

  getFrbData(): Observable<IFrbMockData> {
    return of(this.mockData).pipe(delay(200)); // simule une latence réseau
  }
}


private readonly USE_FRB_MOCK = true; // 🔧 à repasser à false quand le backend sera prêt

private frbMockService = inject(FrbMockService);

fetchRatingPolicyDetails() {
  this.workflowService.fetchRatingPolicyDetails(fetchRatingPolicy).subscribe(details => {
    this.ratingPolicySelectionDetails = details;
    this.initRatingPolicySelectionForm();

    if (this.USE_FRB_MOCK) {
      this.frbMockService.getFrbData().subscribe(frbData => {
        this.frbRatingPerimeter = frbData.frbRatingPerimeter;
        this.frbModelCode = frbData.frbModelCode;
        this.checkFrbSrpAuthorization();
        this.handleLoadingSRPSummaryComponent(); // re-déclenche l'affichage/masquage avec les vraies valeurs mockées
      });
    } else {
      this.frbRatingPerimeter = details?.frbRatingPerimeter ?? null;
      this.frbModelCode = details?.frbModelCode ?? null;
    }

    this.workflowService.refreshPropagationSchemesEligibleValue(this.ratingPolicySelectionDetails?.propagationSchemesEligible);
    this.workflowService.refreshSrpValue(details?.currentSrpUsed === 'PLACH' ? 'PLACM' : details?.currentSrpUsed);
    this.workflowService.updateInheritanceType(details?.typeOfInheritance);
  });
}
