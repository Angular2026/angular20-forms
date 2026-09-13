export class WorkflowDefaultCounterpartyBlockComponent {
  public defaultClientForm = input.required<FormGroup>();
  public canDefault = input(false);
  public savedIsDefault = input<boolean | null>(null);
  public hasManagerRight = input(false);
  public maxChars = input(500);

  public counterpartyRatingVisible = output<boolean>();

  // les valeurs du formulaire, en signals
  private readonly processValue = toSignal(
    toObservable(this.defaultClientForm).pipe(
      switchMap(form => form.get('defaultingProcess')!.valueChanges.pipe(
        startWith(form.get('defaultingProcess')!.value),
      )),
    ),
  );

  private readonly committeeValue = toSignal(
    toObservable(this.defaultClientForm).pipe(
      switchMap(form => form.get('decisionMakingCommittee')!.valueChanges.pipe(
        startWith(form.get('decisionMakingCommittee')!.value),
      )),
    ),
  );

  private readonly decisionDateValue = toSignal(
    toObservable(this.defaultClientForm).pipe(
      switchMap(form => form.get('committeeDecisionDate')!.valueChanges.pipe(
        startWith(form.get('committeeDecisionDate')!.value),
      )),
    ),
  );

  protected readonly branch = computed<'NONE' | 'DEFAULT_REVIEW' | 'BACK_PERFORMING'>(() => {
    if (!this.canDefault()) return 'DEFAULT_REVIEW';
    if (this.savedIsDefault() === true) return 'DEFAULT_REVIEW';
    if (this.savedIsDefault() === false) return 'BACK_PERFORMING';
    return 'NONE';
  });

  protected readonly showDefaultingProcess = computed(() => this.canDefault());
  protected readonly showBackToPerforming = computed(() => this.branch() === 'BACK_PERFORMING');
  protected readonly showDecisionMakingCommittee = computed(() => this.branch() === 'DEFAULT_REVIEW');

  protected readonly showCommitteeRatingDecisionDate = computed(() =>
    this.branch() === 'DEFAULT_REVIEW' &&
    ['CREDIT_COMMITTEE', 'WATCHLIST_COMMITTEE', 'OTHER'].includes(this.committeeValue()),
  );

  protected readonly showCommentAuthorityField = computed(() =>
    this.branch() === 'DEFAULT_REVIEW' && this.committeeValue() === 'OTHER',
  );

  protected readonly showCounterpartyRating = computed(() => {
    const dateControl = this.defaultClientForm().get('committeeDecisionDate');
    return this.showCommitteeRatingDecisionDate()
      && !!this.decisionDateValue()
      && !dateControl?.errors;
  });

  constructor() {
    // les computed pilotent l'affichage ; cet effect ne fait que
    // synchroniser les validateurs, qui vivent hors du monde des signals
    effect(() => {
      const form = this.defaultClientForm();
      this.setRequired(form.get('defaultingProcess'), this.canDefault());
      this.setRequired(form.get('decisionMakingCommittee'), this.showDecisionMakingCommittee());
      this.setRequired(form.get('committeeDecisionDate'), this.showCommitteeRatingDecisionDate());
      this.setRequired(form.get('commentAuthority'), this.showCommentAuthorityField());
      this.setRequired(form.get('rating.counterPartyRating'), this.showCounterpartyRating());

      this.counterpartyRatingVisible.emit(this.showCounterpartyRating());
    });
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

