export class RatingPolicyChoiceComponent implements OnInit, OnDestroy {
  // ... propriétés existantes (workflowDTO, rmpmId, etc.) ...

  // ── BR02/BR03/BR04 ──────────────────────────────────────────
  private frbRatingPerimeter: string | null = null;
  private frbModelCode: string | null = null;
  private baseFormControlNames: string[] = [];
  private srpLoadTrigger$ = new Subject<void>();

  // 🔧 TODO-MOCK: repasser à false / supprimer quand le backend sera prêt
  private readonly USE_FRB_MOCK = true;
  // TODO-MOCK: retirer cette injection avec le flag ci-dessus
  private frbMockService = inject(FrbMockService);

  loadRequiredComponent() {
  console.log('[DEBUG] loadRequiredComponent appelé, va créer le composant dans container'); // TODO-DEBUG
  this.container?.clear();
  this.componentRef = this.container?.createComponent(this.selectedSRPSummaryComponent);
  // ...
}

  private deactivateSrpDecisionTree(): void {
  console.log('[DEBUG] deactivateSrpDecisionTree appelé, container=', this.container); // TODO-DEBUG
  this.container?.clear();
  // ...
}

  handleLoadingSRPSummaryComponent() {
  console.log('[DEBUG] handleLoadingSRPSummaryComponent → next() appelé'); // TODO-DEBUG
  this.srpLoadTrigger$.next();
}

  constructor() {
  this.srpLoadTrigger$
    .pipe(
      switchMap(() => {
        console.log('[DEBUG] srpLoadTrigger$ déclenché, shouldDeactivate=', this.shouldDeactivateSrpDecisionTree, 'frbRatingPerimeter=', this.frbRatingPerimeter, 'frbModelCode=', this.frbModelCode); // TODO-DEBUG
        if (this.shouldDeactivateSrpDecisionTree) {
          return of(null);
        }
        const model = this.registry.find(m => m.modelCode === this.modelType);
        console.log('[DEBUG] model trouvé dans registry?', !!model, 'modelType=', this.modelType); // TODO-DEBUG
        return model ? from(model.loadComponent()) : of(null);
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe(componentRef => {
      console.log('[DEBUG] subscribe résolu, componentRef=', componentRef, 'shouldDeactivate maintenant=', this.shouldDeactivateSrpDecisionTree); // TODO-DEBUG
      if (this.shouldDeactivateSrpDecisionTree) {
        this.deactivateSrpDecisionTree();
        return;
      }
      if (componentRef) {
        this.selectedSRPSummaryComponent = componentRef;
        this.loadRequiredComponent();
      }
    });
}

  // ── Fetch ───────────────────────────────────────────────────
  fetchRatingPolicyDetails() {
    const fetchRatingPolicy: IRatingPolicyData = {
      encryptedWorkflowUUID: this.workflowDTO().encryptedUUID,
      salt: this.workflowDTO().salt,
    };
    this.workflowService.fetchRatingPolicyDetails(fetchRatingPolicy).subscribe(details => {
      this.ratingPolicySelectionDetails = details;

      // TODO-MOCK: bloc entier à supprimer, garder uniquement le contenu du `else`
      if (this.USE_FRB_MOCK) {
        this.frbMockService.getFrbData().subscribe(frbData => {
          this.frbRatingPerimeter = frbData.frbRatingPerimeter;
          this.frbModelCode = frbData.frbModelCode;
          this.checkFrbSrpAuthorization();
          this.initRatingPolicySelectionForm();
        });
      } else {
        // ✅ code définitif : adapter les noms de champs une fois confirmés par Partha
        this.frbRatingPerimeter = details?.frbRatingPerimeter ?? null;
        this.frbModelCode = details?.frbModelCode ?? null;
        this.initRatingPolicySelectionForm();
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

  // ── Change SRP (liste déroulante ou init) ─────────────────────
  changeRatingPolicy(policy) {
    this.resetRatingPolicySelectionFormm(policy);
    this.captureBaseFormControlNames();
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
        this.captureBaseFormControlNames();
      }
      this.container.clear();
      this.ratingPolicySelectionDetails = null;
      // ⚠️ ne PAS remettre frbRatingPerimeter / frbModelCode à null ici
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
    this.srpLoadTrigger$.next();
  }

  private deactivateSrpDecisionTree(): void {
    this.container?.clear();
    this.componentRef = undefined;
    this.selectedSRPSummaryComponent = undefined;

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
    if (this.frbRatingPerimeter !== 'Y') {
      return;
    }

    const srpControl = this.ratingPolicySelectionForm.get('currentSrpUsed');
    const srpValue = srpControl?.value;

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
