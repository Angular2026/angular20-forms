external-ratings-config.ts

export type ProjectSector =
  | 'CARBON_ABATEMENT_ALTERNATIVE_SOLUTIONS'
  | 'INFRASTRUCTURE'
  | 'MIDSTREAM_DOWNSTREAM_ENERGIES'
  | 'POWER_CONVENTIONAL'
  | 'POWER_NUCLEAR'
  | 'POWER_RENEWABLES'
  | 'TMMB'
  | 'UPSTREAM_OG'
  | 'OTHER';

export type ProjectSubSector = string; // valeurs alignées sur le fichier "List_of_sectors_and_subsectors_03_2026"

export const projectSectorOptions: ISelectionOption[] = [
  { label: $localize`:@@sectorCarbonAbatementLabel:Réduction du carbone et solutions alternatives`, value: 'CARBON_ABATEMENT_ALTERNATIVE_SOLUTIONS' as ProjectSector },
  { label: $localize`:@@sectorInfrastructureLabel:Infrastructure`, value: 'INFRASTRUCTURE' as ProjectSector },
  { label: $localize`:@@sectorMidstreamDownstreamLabel:Energies intermédiaires et en aval`, value: 'MIDSTREAM_DOWNSTREAM_ENERGIES' as ProjectSector },
  { label: $localize`:@@sectorPowerConventionalLabel:Energie conventionnelle`, value: 'POWER_CONVENTIONAL' as ProjectSector },
  { label: $localize`:@@sectorPowerNuclearLabel:Energie nucléaire`, value: 'POWER_NUCLEAR' as ProjectSector },
  { label: $localize`:@@sectorPowerRenewablesLabel:Energie renouvelables`, value: 'POWER_RENEWABLES' as ProjectSector },
  { label: $localize`:@@sectorTmmbLabel:TMMB`, value: 'TMMB' as ProjectSector },
  { label: $localize`:@@sectorUpstreamOGLabel:Upstream O&G`, value: 'UPSTREAM_OG' as ProjectSector },
  { label: $localize`:@@sectorOtherLabel:Autre`, value: 'OTHER' as ProjectSector },
];

// Sous-secteurs par secteur — valeurs à réconcilier avec le fichier source
export const projectSubSectorOptionsBySector: Record<ProjectSector, ISelectionOption[]> = {
  CARBON_ABATEMENT_ALTERNATIVE_SOLUTIONS: [
    { label: $localize`:@@subCarbonCaptureLabel:Capture du carbone`, value: 'CARBON_CAPTURE' },
    { label: $localize`:@@subCarbonTransportStorageLabel:Stockage et transportation du carbone`, value: 'CARBON_TRANSPORTATION_STORAGE' },
  ],
  INFRASTRUCTURE: [
    { label: $localize`:@@subAirportLabel:Aéroport`, value: 'AIRPORT' },
    { label: $localize`:@@subCarParkLabel:Parking`, value: 'CAR_PARK' },
    { label: $localize`:@@subDataCentersLabel:Centres de données`, value: 'DATA_CENTERS' },
    { label: $localize`:@@subDistrictHeatingLabel:Chauffage`, value: 'DISTRICT_HEATING_COOLING' },
    { label: $localize`:@@subElecGasNetworksLabel:Réseaux de transmission et de distribution d'électricité et de gaz`, value: 'ELECTRICITY_GAS_TRANSMISSION_DISTRIBUTION_NETWORKS' },
    { label: $localize`:@@subEnergyFromWasteLabel:Énergie provenant des déchets et traitement des déchets`, value: 'ENERGY_FROM_WASTE_WASTE_TREATMENT' },
    { label: $localize`:@@subFibreLabel:Fibre`, value: 'FIBRE' },
    { label: $localize`:@@subHealthcareLabel:Santé`, value: 'HEALTHCARE' },
    { label: $localize`:@@subIndustrialEnergyServicesLabel:Services énergétiques industriels`, value: 'INDUSTRIAL_ENERGY_SERVICES' },
    { label: $localize`:@@subOtherInfraLabel:Autres infrastructures`, value: 'OTHER_INFRASTRUCTURE' },
    { label: $localize`:@@subPassengerTransportLabel:Transport de passagers`, value: 'PASSENGER_TRANSPORTATION' },
    { label: $localize`:@@subPortLabel:Port`, value: 'PORT' },
    { label: $localize`:@@subRailwayLabel:Infrastructure ferroviaire`, value: 'RAILWAY_INFRASTRUCTURE' },
    { label: $localize`:@@subRoadLabel:Infrastructures routières`, value: 'ROAD_INFRASTRUCTURE' },
    { label: $localize`:@@subRollingStockLabel:Matériel roulant`, value: 'ROLLING_STOCK' },
    { label: $localize`:@@subSmartMetersLabel:Compteurs intelligents`, value: 'SMART_METERS' },
    { label: $localize`:@@subTelecomTowersLabel:Tours de télécommunication`, value: 'TELECOM_TOWERS' },
    { label: $localize`:@@subWaterTreatmentLabel:Traitement et distribution de l'eau`, value: 'WATER_TREATMENT_DISTRIBUTION' },
    { label: $localize`:@@subSocialInfraLabel:Infrastructure sociale (y compris éducation, sécurité, défense, hors santé)`, value: 'SOCIAL_INFRASTRUCTURE' },
  ],
  MIDSTREAM_DOWNSTREAM_ENERGIES: [
    { label: $localize`:@@subAdvancedBiofuelsLabel:Biocarburants avancés`, value: 'ADVANCED_BIOFUELS' },
    { label: $localize`:@@subBiomethaneBiogasLabel:Biométhane et biogaz`, value: 'BIOMETHANE_BIOGAS' },
    { label: $localize`:@@subHydrogenLabel:Production d'hydrogène et de ses dérivés (y compris les e-carburants)`, value: 'HYDROGEN_DERIVATIVES_PRODUCTION' },
    { label: $localize`:@@subLngLiquefactionLabel:Liquéfaction de GNL`, value: 'LNG_LIQUEFACTION' },
    { label: $localize`:@@subRegasificationLabel:Régazéification`, value: 'REGASIFICATION' },
    { label: $localize`:@@subOtherMidstreamLabel:Autre`, value: 'OTHER_MIDSTREAM_DOWNSTREAM' },
    { label: $localize`:@@subPipelineLabel:Pipeline`, value: 'PIPELINE' },
    { label: $localize`:@@subRefineriesLabel:Raffineries et pétrochimie`, value: 'REFINERIES_PETROCHEMICALS' },
    { label: $localize`:@@subStorageLabel:Stockage`, value: 'STORAGE' },
  ],
  POWER_CONVENTIONAL: [
    { label: $localize`:@@subCoalFiredLabel:Charbon`, value: 'COAL_FIRED' },
    { label: $localize`:@@subGasFiredLabel:Gaz`, value: 'GAS_FIRED' },
  ],
  POWER_NUCLEAR: [
    { label: $localize`:@@subNuclearProductionLabel:Production d'énergie nucléaire`, value: 'NUCLEAR_POWER_PRODUCTION' },
  ],
  POWER_RENEWABLES: [
    { label: $localize`:@@subBessLabel:BESS`, value: 'BESS' },
    { label: $localize`:@@subCspLabel:CSP`, value: 'CSP' },
    { label: $localize`:@@subOffshoreWindLabel:Éolien en mer`, value: 'OFFSHORE_WIND' },
    { label: $localize`:@@subOnshoreWindLabel:Éolien terrestre`, value: 'ONSHORE_WIND' },
    { label: $localize`:@@subOtherRenewablesLabel:Autres énergies renouvelables`, value: 'OTHER_RENEWABLES' },
    { label: $localize`:@@subSolarPvLabel:Photovoltaïque solaire`, value: 'SOLAR_PV' },
    { label: $localize`:@@subBatteryEcosystemLabel:Écosystème de batteries`, value: 'BATTERY_ECOSYSTEM' },
    { label: $localize`:@@subEvChargingLabel:EV charging`, value: 'EV_CHARGING' },
  ],
  TMMB: [
    { label: $localize`:@@subMetalsNonFerrousMetallurgyLabel:Métaux - Métallurgie non ferreuse`, value: 'METALS_NON_FERROUS_METALLURGY' },
    { label: $localize`:@@subMetalsNonFerrousOreLabel:Métaux - Extraction de minerais non ferreux`, value: 'METALS_NON_FERROUS_ORE_EXTRACTION' },
    { label: $localize`:@@subMetalsSteelLabel:Métal - Acier`, value: 'METALS_STEEL' },
    { label: $localize`:@@subTransitionMineralsLabel:Minéraux de transition`, value: 'TRANSITION_MINERALS' },
  ],
  UPSTREAM_OG: [
    { label: $localize`:@@subUpstreamOGLabel:Upstream O&G`, value: 'UPSTREAM_OG' },
  ],
  OTHER: [
    { label: $localize`:@@subOtherLabel:Autre`, value: 'OTHER' },
  ],
};

// BR07 — liste des couples Secteur/Sous-secteur éligibles à l'uplift (condition 1, région EMEA)
// NB ticket: doit être facilement pilotable "par une requête" -> à terme externaliser (config API/back), en attendant reste ici centralisé.
export const STRONG_FUNDAMENTALS_UPLIFT_PAIRS: { sector: ProjectSector; subSector: ProjectSubSector }[] = [
  { sector: 'INFRASTRUCTURE', subSector: 'SOCIAL_INFRASTRUCTURE' },
  { sector: 'INFRASTRUCTURE', subSector: 'RAILWAY_INFRASTRUCTURE' },
  { sector: 'INFRASTRUCTURE', subSector: 'ROLLING_STOCK' },
  { sector: 'INFRASTRUCTURE', subSector: 'PASSENGER_TRANSPORTATION' },
  { sector: 'INFRASTRUCTURE', subSector: 'ELECTRICITY_GAS_TRANSMISSION_DISTRIBUTION_NETWORKS' },
  { sector: 'INFRASTRUCTURE', subSector: 'DISTRICT_HEATING_COOLING' },
  { sector: 'INFRASTRUCTURE', subSector: 'SMART_METERS' },
  { sector: 'INFRASTRUCTURE', subSector: 'FIBRE' },
  { sector: 'INFRASTRUCTURE', subSector: 'TELECOM_TOWERS' },
];

// BR07 — condition 2 : secteur seul suffit
export const STRONG_FUNDAMENTALS_UPLIFT_SECTORS: ProjectSector[] = ['POWER_RENEWABLES'];

2. project-phase.component.ts


readonly projectPhaseForm = this.formBuilder.group({
  projectPhase: this.formBuilder.control<ProjectPhase | null>(null, Validators.required),
  technicalRisk: this.formBuilder.control<RiskLevel | null>(null),
  hasCompletionGuarantor: this.formBuilder.control<boolean | null>(null),
  transactionType: this.formBuilder.control<TransactionType | null>(null),
  pmoRisk: this.formBuilder.control<PMORisk | null>(null),
  projectSector: this.formBuilder.control<ProjectSector | null>(null),
  projectSubSector: this.formBuilder.control<ProjectSubSector | null>(null),
  hasStrongFundamentals: this.formBuilder.control<boolean | null>({ value: null, disabled: true }),
  hasSponsor: this.formBuilder.control<boolean | null>(null),
});

private readonly controlFlow = [
  'projectPhase',
  'technicalRisk',
  'hasCompletionGuarantor',
  'transactionType',
  'pmoRisk',
  'projectSector',
  'projectSubSector',
  'hasSponsor',
];

public projectSectorOptions: ISelectionOption[] = projectSectorOptions;

readonly projectSubSectorOptions = computed<ISelectionOption[]>(() => {
  const sector = this.formValue().projectSector;
  return sector ? projectSubSectorOptionsBySector[sector] : [];
});


readonly showProjectSector = computed(() => {
  return this.showPmoRisk() && this.hasValue(this.formValue().pmoRisk);
});

readonly showProjectSubSector = computed(() => {
  return this.showProjectSector() && this.hasValue(this.formValue().projectSector);
});

readonly showStrongFundamentals = computed(() => {
  return this.showProjectSubSector() && this.hasValue(this.formValue().projectSubSector);
});

readonly showProjectSponsor = computed(() => {
  return this.showStrongFundamentals(); // BR06 : dès que dispo, la donnée calculée existe forcément
});

readonly isStrongFundamentals = computed<boolean>(() => {
  const sector = this.formValue().projectSector;
  const subSector = this.formValue().projectSubSector;
  if (!sector || !subSector) {
    return false;
  }

  const hostCountryRegion = this.workflowDTO().hostCountryRegion;

  const meetsCondition1 =
    hostCountryRegion === 'EMEA' &&
    STRONG_FUNDAMENTALS_UPLIFT_PAIRS.some(pair => pair.sector === sector && pair.subSector === subSector);

  const meetsCondition2 = STRONG_FUNDAMENTALS_UPLIFT_SECTORS.includes(sector);

  return meetsCondition1 || meetsCondition2; // BR08 : sinon "No" par défaut
});

// Synchronise la valeur calculée dans le control disabled (pour transmission au parent / persistance BR09)
private readonly syncStrongFundamentals = effect(() => {
  this.projectPhaseForm.controls.hasStrongFundamentals.setValue(this.isStrongFundamentals(), { emitEvent: false });
});


updateDynamicValidatorsAndResets() — remplacer le bloc hasStrongFundamentals / hasSponsor :

updateDynamicValidatorsAndResets() {
  const { projectPhase, hasCompletionGuarantor, technicalRisk, transactionType, pmoRisk, projectSector, projectSubSector, hasSponsor } = this.projectPhaseForm.controls;

  // ... (blocs projectPhase / technicalRisk / hasCompletionGuarantor / transactionType / pmoRisk inchangés)

  const showProjectSector = showPmoRisk && this.hasValue(pmoRisk.value);
  this.setRequired(projectSector, showProjectSector);
  this.resetIfHidden(projectSector, showProjectSector);

  const showProjectSubSector = showProjectSector && this.hasValue(projectSector.value);
  this.setRequired(projectSubSector, showProjectSubSector);
  this.resetIfHidden(projectSubSector, showProjectSubSector);

  // hasStrongFundamentals : plus de setRequired/resetIfHidden, c'est une donnée calculée (cf. isStrongFundamentals + effect)

  const showSponsor = showProjectSubSector && this.hasValue(projectSubSector.value);
  this.setRequired(hasSponsor, showSponsor);
  this.resetIfHidden(hasSponsor, showSponsor);
}

this.projectPhaseForm.patchValue({
  // ... champs existants inchangés
  projectSector: rating.projectPhaseInfo.projectSector,
  projectSubSector: rating.projectPhaseInfo.projectSubSector,
});

@if (showProjectSector()) {
  <div class="row-item">
    <div class="row-label" i18n="label for Project Sector@@projectSectorLabel">Secteur du projet</div>
    <div class="row-content">
      <bnpp-workflow-selection
        class="w-100"
        [options]="projectSectorOptions"
        [selectionControl]="projectPhaseForm.controls.projectSector"
        aria-required="true"
      ></bnpp-workflow-selection>
    </div>
  </div>
}
@if (projectPhaseForm.controls.projectSector.touched && projectPhaseForm.controls.projectSector.errors && projectPhaseForm.controls.projectSector.errors['required']) {
  <div class="field-error-container">
    <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
  </div>
}

@if (showProjectSubSector()) {
  <div class="row-item">
    <div class="row-label" i18n="label for Project Sub-sector@@projectSubSectorLabel">Sous-secteur du projet</div>
    <div class="row-content">
      <bnpp-workflow-selection
        class="w-100"
        [options]="projectSubSectorOptions()"
        [selectionControl]="projectPhaseForm.controls.projectSubSector"
        aria-required="true"
      ></bnpp-workflow-selection>
    </div>
  </div>
}
@if (projectPhaseForm.controls.projectSubSector.touched && projectPhaseForm.controls.projectSubSector.errors && projectPhaseForm.controls.projectSubSector.errors['required']) {
  <div class="field-error-container">
    <mat-error i18n="Ce champ est manquant@@fieldMissingErrorLabel">Ce champ est manquant</mat-error>
  </div>
}

@if (showStrongFundamentals()) {
  <div class="row-item">
    <div class="row-label" i18n="label for Strong Fundamentals@@strongFundamentalsLabel">Solides bases</div>
    <div class="row-content">
      <!-- TODO: remplacer par le composant "Data" partagé (cf. tooltip US AER_07272NEXT-4056) -->
      {{ isStrongFundamentals() ? yesLabel : noLabel }}
    </div>
  </div>
}
