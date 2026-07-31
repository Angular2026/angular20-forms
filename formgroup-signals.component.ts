// ── Constantes BR04 ──────────────────────────────────────────
const FRB_AUTHORIZED_MODEL_PREFIXES: string[] = [
  'PLACM', 'PLACH', 'PASFM', 'PASFH', 'PPRFM', 'PPRFH', 'PGALM', 'PSOVD',
];
const FRB_AUTHORIZED_EXACT_VALUES: string[] = ['SAVE'];

export class RatingPolicyChoiceComponent implements OnInit, OnDestroy {
  // ... propriétés existantes ...

  // ── Propriétés BR02/BR03/BR04 ──────────────────────────────
  private frbRatingPerimeter: string | null = null;
  private frbModelCode: string | null = null;
  private baseFormControlNames: string[] = [];

  // 🔧 TODO-MOCK: repasser à false (ou supprimer) quand le backend sera prêt
  private readonly USE_FRB_MOCK = true;
  // TODO-MOCK: retirer cette injection avec le flag ci-dessus
  private frbMockService = inject(FrbMockService);

  // ── Fetch ───────────────────────────────────────────────────
  fetchRatingPolicyDetails() {
    this.workflowService.fetchRatingPolicyDetails(fetchRatingPolicy).subscribe(details => {
      this.ratingPolicySelectionDetails = details;
      this.initRatingPolicySelectionForm();

      // TODO-MOCK: bloc entier à supprimer, garder uniquement le `else`
      // une fois que `details` contiendra réellement frbRatingPerimeter/frbModelCode
      if (this.USE_FRB_MOCK) {
        this.frbMockService.getFrbData().subscribe(frbData => {
          this.frbRatingPerimeter = frbData.frbRatingPerimeter;
          this.frbModelCode = frbData.frbModelCode;
          this.checkFrbSrpAuthorization();
          this.handleLoadingSRPSummaryComponent();
        });
      } else {
        // ✅ code définitif : à garder, adapter les noms de champs une fois confirmés par Partha
        this.frbRatingPerimeter = details?.frbRatingPerimeter ?? null;
        this.frbModelCode = details?.frbModelCode ?? null;
      }

      this.workflowService.refreshPropagationSchemesEligibleValue(this.ratingPolicySelectionDetails?.propagationSchemesEligible);
      this.workflowService.refreshSrpValue(details?.currentSrpUsed === 'PLACH' ? 'PLACM' : details?.currentSrpUsed);
      this.workflowService.updateInheritanceType(details?.typeOfInheritance);
    });
  }

  // ── Init ────────────────────────────────────────────────────
  initRatingPolicySelectionForm() {
    this.addCurrentSRPControl();
    this.captureBaseFormControlNames();

    if (this.ratingPolicySelectionDetails?.currentSrpUsed) {
      this.changeRatingPolicy(
        this.ratingPolicySelectionDetails.currentSrpUsed === 'PLACH'
          ? 'PLACM'
          : this.ratingPolicySelectionDetails.currentSrpUsed,
      );
    }

    if (!this.registry.find(model => model.modelCode === this.modelType)) {
      this.handleNotPDLargeCorporate();
    }

    if (this.canMarkWorkflowSectionValid()) {
      this.alertsBoxService.setSectionValid('specificRatingPolicyChoice');
      this.alertsBoxService.setSectionValid('refernceSpreadSheet');
    }
  }

  // ── Change SRP (déclenché par la liste déroulante ou init) ───
  changeRatingPolicy(policy) {
    this.resetRatingPolicySelectionFormm(policy);
    this.captureBaseFormControlNames(); // ✅ re-snapshot après recréation du form
    this.triggerRatingPolicyModelChanged(policy);

    if (this.registry.find(model => model.modelCode === this.modelType)) {
      this.handleLoadingSRPSummaryComponent();
    } else {
      if (!this.isRecommendedSRPValidated(policy)) {
        this.ratingPolicySelectionForm = this.formBuilder.group({
          currentSrpUsed: [policy, Validators.required],
          srpOverrideComments: [
            null,
            Validators.compose([Validators.required, Validators.maxLength(this.maxChars())]),
          ],
        });
        this.captureBaseFormControlNames(); // ✅ re-snapshot, srpOverrideComments devient "de base" ici
      }
      this.container.clear();
      this.ratingPolicySelectionDetails = null;
      // ⚠️ ne PAS remettre frbRatingPerimeter / frbModelCode à null ici (BR02 doit continuer à fonctionner)
    }

    this.checkFrbSrpAuthorization();
  }

  private resetRatingPolicySelectionFormm(policy): void {
    this.ratingPolicySelectionForm = this.formBuilder.group({
      currentSrpUsed: [policy, Validators.required],
    });
  }

  private captureBaseFormControlNames(): void {
    this.baseFormControlNames = Object.keys(this.ratingPolicySelectionForm.controls);
  }

  // ── BR02 : déactivation de l'arbre SRP ────────────────────────
  get shouldDeactivateSrpDecisionTree(): boolean {
    return this.frbRatingPerimeter === 'Y' && this.isSrpAuthorizedForFrb(this.frbModelCode);
  }

  handleLoadingSRPSummaryComponent() {
    if (this.shouldDeactivateSrpDecisionTree) {
      this.deactivateSrpDecisionTree();
      return;
    }

    this.registry
      .find(model => model.modelCode === this.modelType)
      ?.loadComponent()
      .then(componentRef => {
        this.selectedSRPSummaryComponent = componentRef;
        this.loadRequiredComponent();
      });
  }

  private deactivateSrpDecisionTree(): void {
    this.container?.clear();
    this.componentRef = undefined;
    this.selectedSRPSummaryComponent = undefined;

    // retire tous les controls dynamiques ajoutés par le composant SRP enfant
    Object.keys(this.ratingPolicySelectionForm.controls)
      .filter(name => !this.baseFormControlNames.includes(name))
      .forEach(name => this.ratingPolicySelectionForm.removeControl(name));
  }

  // ── BR04 : autorisation du SRP sélectionné ────────────────────
  private isSrpAuthorizedForFrb(srp: string): boolean {
    if (!srp) {
      return true;
    }
    return (
      FRB_AUTHORIZED_EXACT_VALUES.includes(srp) ||
      FRB_AUTHORIZED_MODEL_PREFIXES.some(prefix => srp.startsWith(prefix))
    );
  }

  private checkFrbSrpAuthorization = (): void => {
    const srpControl = this.ratingPolicySelectionForm.get('currentSrpUsed');
    const srpValue = srpControl?.value;

    if (this.frbRatingPerimeter !== 'Y') {
      return;
    }

    if (!this.isSrpAuthorizedForFrb(srpValue)) {
      srpControl.setErrors({ notAuthorizedFrbSrp: true });
      this.alertsBoxService.addAlerts('errors', [
        {
          alertTextId: 'notAuthorizedFrbSrp',
          fragmentId: 'specificRatingPolicyChoice',
          anchorId: 'specificRatingPolicyChoice',
        },
      ]);
    }
  };
}



// ⚠️ TODO-MOCK: FICHIER ENTIÈREMENT TEMPORAIRE
// À SUPPRIMER quand le backend fournira frbRatingPerimeter / frbModelCode
// dans la réponse réelle de fetchRatingPolicyDetails (DTO à confirmer avec Partha)
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface IFrbMockData {
  frbRatingPerimeter: string; // 'Y' | 'N'
  frbModelCode: string;
}

@Injectable({ providedIn: 'root' })
export class FrbMockService {
  // 🔧 TODO-MOCK: change ces valeurs pour tester BR02/BR03/BR04
  // ex: frbModelCode: 'XXXXX' pour tester le cas "non autorisé" (BR04)
  private readonly mockData: IFrbMockData = {
    frbRatingPerimeter: 'Y',
    frbModelCode: 'PLACM010',
  };

  getFrbData(): Observable<IFrbMockData> {
    return of(this.mockData).pipe(delay(200)); // TODO-MOCK: simule la latence réseau
  }
}
