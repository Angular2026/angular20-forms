intrinsicRatingProposedCtrl = computed(
  () => this.ratingForm().get('intrinsicRatingCodeProposed') as FormControl<string | null>
);

supportDirectionCtrl = computed(
  () => this.ratingForm().get('supportDirection') as FormControl<string | null>
);

supportStrengthCtrl = computed(
  () => this.ratingForm().get('supportStrength') as FormControl<string | null>
);

intrinsicRatingProposedValue = signal<string | null>(null);
supportDirectionValue = signal<string | null>(null);
supportStrengthValue = signal<string | null>(null);

readonly isBr04AutoFill = computed(() => {
  const supportDirection = this.supportDirectionValue();
  const supportStrength = this.supportStrengthValue();

  const isNegativeWeak =
    supportDirection === 'Negative' && supportStrength === 'Weak';

  const isPositiveUndeterminedOrWeak =
    supportDirection === 'Positive' &&
    (supportStrength === 'Undetermined' || supportStrength === 'Weak');

  const hasNoSupportEffect = !supportDirection && !supportStrength;

  return isNegativeWeak || isPositiveUndeterminedOrWeak || hasNoSupportEffect;
});

readonly br04SyncRatingValueEffect = effect(() => {
  const ratingProposedCtrl = this.ratingProposedCtrl();
  const intrinsicRatingValue = this.intrinsicRatingProposedValue();
  const isBr04AutoFill = this.isBr04AutoFill();

  if (isBr04AutoFill && ratingProposedCtrl.value !== intrinsicRatingValue) {
    ratingProposedCtrl.setValue(intrinsicRatingValue, { emitEvent: false });
  }
});

readonly br04ReadonlyEffect = effect(() => {
  const ratingProposedCtrl = this.ratingProposedCtrl();
  const isBr04AutoFill = this.isBr04AutoFill();

  if (isBr04AutoFill && ratingProposedCtrl.enabled) {
    ratingProposedCtrl.disable({ emitEvent: false });
  } else if (!isBr04AutoFill && ratingProposedCtrl.disabled) {
    ratingProposedCtrl.enable({ emitEvent: false });
  }

  ratingProposedCtrl.updateValueAndValidity({ emitEvent: false });
});

ngOnInit(): void {
  this.ratingProposedCtrl().valueChanges
    .pipe(
      startWith(this.ratingProposedCtrl().value),
      takeUntilDestroyed(this.destroyRef$),
    )
    .subscribe(value => {
      this.ratingProposedValue.set(value);
    });

  this.intrinsicRatingProposedCtrl().valueChanges
    .pipe(
      startWith(this.intrinsicRatingProposedCtrl().value),
      takeUntilDestroyed(this.destroyRef$),
    )
    .subscribe(value => {
      this.intrinsicRatingProposedValue.set(value);
    });

  this.supportDirectionCtrl().valueChanges
    .pipe(
      startWith(this.supportDirectionCtrl().value),
      takeUntilDestroyed(this.destroyRef$),
    )
    .subscribe(value => {
      this.supportDirectionValue.set(value);
    });

  this.supportStrengthCtrl().valueChanges
    .pipe(
      startWith(this.supportStrengthCtrl().value),
      takeUntilDestroyed(this.destroyRef$),
    )
    .subscribe(value => {
      this.supportStrengthValue.set(value);
    });
}
