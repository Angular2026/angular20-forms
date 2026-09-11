@Component({
  selector: 'bnpp-workflow-default-counterparty-block',
  templateUrl: './workflow-default-counterparty-block.component.html',
  styleUrls: ['./workflow-default-counterparty-block.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MaterialModule,
    WorkflowDefaultCounterpartyDefaultingProcessComponent,
  ],
})
export class WorkflowDefaultCounterpartyBlockComponent implements OnInit {
  public workflowDTO = input.required<WorkflowDocument>();
  public rmpmId = input.required<string>();
  public defaultClientForm = input.required<FormGroup>();
  public hasManagerRight = input(false);
  public maxChars = input(500);

  /** flag back : le process de defaut est-il applicable a cette contrepartie */
  public canDefault = input(false);

  /** le parent en a besoin pour afficher le composant rating */
  public counterpartyRatingVisible = output<boolean>();

  public showDecisionMakingCommittee = false;
  public showCommitteeRatingDecisionDate = false;
  public showCommentAuthorityField = false;

  public readonly minDate = new Date(1901, 0, 1);

  protected readonly defaultingProcessOptions: ISelectionOption[] = [
    { label: $localize`:@@defaultingReviewLabel:Revue du défaut`, value: 'DEFAULT_REVIEW' },
    { label: $localize`:@@backToPerformingLabel:Retour en sain`, value: 'BACK_PERFORMING' },
  ];

  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  public ngOnInit(): void {
    const form = this.defaultClientForm();

    this.applyRules();

    merge(
      form.get('defaultingProcess')!.valueChanges,
      form.get('decisionMakingCommittee')!.valueChanges,
      form.get('committeeDecisionDate')!.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyRules());
  }

  public getFormattedAuthenticatedUser(): string {
    const user = this.authService.authenticatedUser['additionalInformation'];
    return `${user?.lastName}, ${user?.firstName}`;
  }

  private applyRules(): void {
    const form = this.defaultClientForm();
    const processControl = form.get('defaultingProcess');
    const committeeControl = form.get('decisionMakingCommittee');
    const dateControl = form.get('committeeDecisionDate');
    const commentControl = form.get('commentAuthority');
    const ratingControl = form.get('rating.counterPartyRating');

    // niveau 0 : le process n'existe que si le back l'autorise.
    // sinon on retombe sur l'ancien comportement (comite toujours requis).
    const isDefaultReview = this.canDefault()
      ? processControl?.value === 'DEFAULT_REVIEW'
      : true;

    const committee = committeeControl?.value;

    const needsDate =
      isDefaultReview &&
      (committee === 'CREDIT_COMMITTEE' ||
        committee === 'WATCHLIST_COMMITTEE' ||
        committee === 'OTHER');

    const needsComment = isDefaultReview && committee === 'OTHER';

    const needsRating = needsDate && !!dateControl?.value && !dateControl?.errors;

    this.showDecisionMakingCommittee = isDefaultReview;
    this.showCommitteeRatingDecisionDate = needsDate;
    this.showCommentAuthorityField = needsComment;

    this.setRequired(processControl, this.canDefault());
    this.setRequired(committeeControl, isDefaultReview);
    this.setRequired(dateControl, needsDate);
    this.setRequired(commentControl, needsComment);
    this.setRequired(ratingControl, needsRating);

    this.counterpartyRatingVisible.emit(needsRating);
  }

  private setRequired(control: AbstractControl | null, required: boolean): void {
    if (!control) return;

    if (required) {
      control.addValidators(Validators.required);
    } else {
      control.removeValidators(Validators.required);
      if (control.value !== null) {
        control.reset(null, { emitEvent: false });
      }
    }
    control.updateValueAndValidity({ emitEvent: false });
  }
}




<div class="default-counterparty-expansion-panel" [formGroup]="defaultClientForm()">
  <div class="crf-mat-expansion-content">
    <mat-card class="crf-mat-expansion-content-card">
      <mat-card-content>

        <div class="row-item fade-in">
          <div class="row-label" i18n="@@lastRatingUsedLabel">Last Specific Rating Policy Used</div>
          <div class="row-content w-100">
            <div class="data-container justify-content-center fw-bold text-success">
              <div class="data-text">
                {{ defaultClientForm().get('lastSpecificRatingPolicy')?.value | ratingPolicyLabel }}
              </div>
            </div>
          </div>
        </div>

        @if (canDefault()) {
          <bnpp-workflow-default-counterparty-defaulting-process
            [defaultClientForm]="defaultClientForm()"
            [options]="defaultingProcessOptions" />
        }

        @if (showDecisionMakingCommittee) {
          <div id="decision-making-committee" class="row-item">
            <!-- ton champ existant, formControlName="decisionMakingCommittee" -->
          </div>

          @if (
            defaultClientForm().get('decisionMakingCommittee')?.touched &&
            defaultClientForm().get('decisionMakingCommittee')?.errors?.['required']
          ) {
            <div class="field-error-container">…</div>
          }
        }

        @if (showCommitteeRatingDecisionDate) {
          <div class="row-item fade-in">
            <mat-form-field>
              <input matInput
                     [matDatepicker]="picker"
                     [min]="minDate"
                     formControlName="committeeDecisionDate" />
              <mat-datepicker #picker />
            </mat-form-field>
          </div>
        }

        @if (showCommentAuthorityField) {
          <div class="row-item fade-in">
            @if (hasManagerRight()) {
              <div class="row-label" i18n="@@commentAuthorityLabel">Commentaire (Editable)</div>
            } @else {
              <div class="row-label" i18n="@@commentAuthorityNonEditableLabel">Commentaire</div>
            }
            <div class="row-content">
              <textarea formControlName="commentAuthority" [maxlength]="maxChars()"></textarea>
            </div>
          </div>
        }

      </mat-card-content>
    </mat-card>
  </div>
</div>





        @Component({
  selector: 'bnpp-workflow-default-counterparty-defaulting-process',
  templateUrl: './workflow-default-counterparty-defaulting-process.component.html',
  styleUrls: ['./workflow-default-counterparty-defaulting-process.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, MaterialModule, WorkflowSelectionComponent],
})
export class WorkflowDefaultCounterpartyDefaultingProcessComponent {
  public defaultClientForm = input.required<FormGroup>();
  public options = input.required<ISelectionOption[]>();

  protected readonly control = computed(
    () => this.defaultClientForm().get('defaultingProcess') as FormControl,
  );
}


protected showCounterpartyRating = false;

protected onCounterpartyRatingVisible(visible: boolean): void {
  this.showCounterpartyRating = visible;
}
