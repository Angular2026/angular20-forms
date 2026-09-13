export class WorkflowDefaultCounterpartyBlockComponent implements OnInit {
  defaultClientForm = input.required<FormGroup>();
  canDefault = input(false);
  savedIsDefault = input<boolean | null>(null);
  hasManagerRight = input(false);
  maxChars = input(500);

  counterpartyRatingVisible = output<boolean>();

  private destroyRef$ = inject(DestroyRef);
  private authService = inject(AuthService);

  // --- controles
  readonly processCtrl = computed(
    () => this.defaultClientForm().get('defaultingProcess') as FormControl<DefaultingProcess | null>,
  );
  readonly committeeCtrl = computed(
    () => this.defaultClientForm().get('decisionMakingCommittee') as FormControl<DecisionMakingCommittee | null>,
  );
  readonly decisionDateCtrl = computed(
    () => this.defaultClientForm().get('committeeDecisionDate') as FormControl<Date | null>,
  );
  readonly commentCtrl = computed(
    () => this.defaultClientForm().get('commentAuthority') as FormControl<string | null>,
  );
  readonly ratingCtrl = computed(
    () => this.defaultClientForm().get('rating.counterPartyRating') as FormControl<string | null>,
  );

  // --- valeurs
  readonly processValue = signal<DefaultingProcess | null>(null);
  readonly committeeValue = signal<DecisionMakingCommittee | null>(null);
  readonly decisionDateValue = signal<Date | null>(null);

  // --- regles d'affichage
  readonly branch = computed<'NONE' | 'DEFAULT_REVIEW' | 'BACK_PERFORMING'>(() => {
    if (!this.canDefault()) return 'DEFAULT_REVIEW';
    if (this.savedIsDefault() === true) return 'DEFAULT_REVIEW';
    if (this.savedIsDefault() === false) return 'BACK_PERFORMING';
    return 'NONE';
  });

  readonly showDefaultingProcess = computed(() => this.canDefault());
  readonly showBackToPerforming = computed(() => this.branch() === 'BACK_PERFORMING');
  readonly showDecisionMakingCommittee = computed(() => this.branch() === 'DEFAULT_REVIEW');

  readonly showCommitteeRatingDecisionDate = computed(() =>
    this.showDecisionMakingCommittee() &&
    ['CREDIT_COMMITTEE', 'WATCHLIST_COMMITTEE', 'OTHER'].includes(this.committeeValue() as string),
  );

  readonly showCommentAuthorityField = computed(() =>
    this.showDecisionMakingCommittee() && this.committeeValue() === 'OTHER',
  );

  readonly showCounterpartyRating = computed(() =>
    this.showCommitteeRatingDecisionDate() &&
    !!this.decisionDateValue() &&
    !this.decisionDateCtrl().errors,
  );

  constructor() {
    // synchronise les validateurs quand les regles changent
    effect(() => {
      this.setRequired(this.processCtrl(), this.canDefault());
      this.setRequired(this.committeeCtrl(), this.showDecisionMakingCommittee());
      this.setRequired(this.decisionDateCtrl(), this.showCommitteeRatingDecisionDate());
      this.setRequired(this.commentCtrl(), this.showCommentAuthorityField());
      this.setRequired(this.ratingCtrl(), this.showCounterpartyRating());

      this.counterpartyRatingVisible.emit(this.showCounterpartyRating());
    });
  }

  ngOnInit(): void {
    this.initFormControls();
  }

  private initFormControls(): void {
    this.processCtrl()
      .valueChanges.pipe(startWith(this.processCtrl().value), takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.processValue.set(value));

    this.committeeCtrl()
      .valueChanges.pipe(startWith(this.committeeCtrl().value), takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.committeeValue.set(value));

    this.decisionDateCtrl()
      .valueChanges.pipe(startWith(this.decisionDateCtrl().value), takeUntilDestroyed(this.destroyRef$))
      .subscribe(value => this.decisionDateValue.set(value));
  }

  getFormattedAuthenticatedUser(): string {
    const user = this.authService.authenticatedUser['additionalInformation'];
    return `${user?.lastName}, ${user?.firstName}`;
  }

  private setRequired(control: AbstractControl | null, required: boolean): void {
    if (!control) return;
    if (required) {
      control.addValidators(Validators.required);
    } else {
      control.removeValidators(Validators.required);
      if (control.value !== null) control.reset(null, { emitEvent: false });
    }
    control.updateValueAndValidity({ emitEvent: false });
  }
}
