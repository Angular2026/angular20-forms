import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { WorkflowService } from '...';
import { LanguageService } from '...';
import { WorkflowValidationService } from '...';
import { IAlert } from '...';

type SupportDirection = 'POSITIVE' | 'NEGATIVE' | null;
type SupportStrength =
  | 'WEAK'
  | 'UNDETERMINED'
  | 'STRONG'
  | 'VERY_STRONG'
  | 'ABSOLUTE'
  | null;

type ValidationSeverity = 'error' | 'warning' | 'none';
type ValidationTarget = 'rating' | 'comment' | 'none';

interface RatingValidationResult {
  severity: ValidationSeverity;
  target: ValidationTarget;
  code:
    | 'supportConsistency'
    | 'mrcCommentRequired'
    | null;
}

@Component({
  selector: 'app-pgnnr-rating-block',
  templateUrl: './pgnnr-rating-block.component.html',
})
export class PgnnrRatingBlockComponent implements OnInit {
  workflowService = inject(WorkflowService);
  languageService = inject(LanguageService);
  private workflowValidationService = inject(WorkflowValidationService);
  private formBuilder = inject(FormBuilder);

  // ---------------------------------
  // Controls
  // ---------------------------------

  readonly ratingProposedCtrl = computed(
    () =>
      this.ratingForm().get(
        'pgnnrCounterpartyRatingDetails.counterpartyRatingProposed'
      ) as FormControl<string | null>
  );

  readonly ratingDateCtrl = computed(
    () =>
      this.ratingForm().get(
        'pgnnrCounterpartyRatingDetails.counterpartyRatingDate'
      ) as FormControl<string | null>
  );

  readonly commentCtrl = computed(
    () =>
      this.ratingForm().get(
        'pgnnrCounterpartyRatingDetails.counterpartyRatingComment'
      ) as FormControl<string | null>
  );

  readonly intrinsicRatingProposedCtrl = computed(
    () =>
      this.ratingForm().get(
        'intrinsicRatingCodeProposed'
      ) as FormControl<string | null>
  );

  readonly supportDirectionCtrl = computed(
    () =>
      this.ratingForm().get(
        'supportDirection'
      ) as FormControl<SupportDirection>
  );

  readonly supportStrengthCtrl = computed(
    () =>
      this.ratingForm().get(
        'supportStrength'
      ) as FormControl<SupportStrength>
  );

  readonly suggrCtrl = computed(
    () =>
      this.ratingForm().get(
        'pgnnrCounterpartyRatingDetails.sugrrProposedByAnalyst'
      ) as FormControl<number | null>
  );

  readonly suggrCommentCtrl = computed(
    () =>
      this.ratingForm().get(
        'pgnnrCounterpartyRatingDetails.sugrrComment'
      ) as FormControl<string | null>
  );

  // ---------------------------------
  // Signals
  // ---------------------------------

  readonly intrinsicRatingProposedValue = signal<string | null>(null);
  readonly supportDirectionValue = signal<SupportDirection>(null);
  readonly supportStrengthValue = signal<SupportStrength>(null);
  readonly ratingProposedValue = signal<string | null>(null);

  readonly commentValue = signal<string>('');

  // ---------------------------------
  // External source values to adapt
  // ---------------------------------
  // IMPORTANT:
  // Replace these 3 computed values with the exact source from your DTO / form / API.
  // I kept them isolated so the rest of the logic stays clean.

  readonly crSupportValue = computed<string | null>(() => {
    // TODO: adapt path/source
    // Example if from DTO:
    // return this.workflowDTO()?.counterpartyRating?.pgnnrCounterpartyRatingDetails?.supportAdjustedCounterpartyRating ?? null;

    // Example if from form:
    // return this.ratingForm().get('pgnnrCounterpartyRatingDetails.counterpartyRatingSupport')?.value ?? null;

    return this.workflowDTO()?.counterpartyRating?.pgnnrCounterpartyRatingDetails
      ?.counterpartyRatingSupport ?? null;
  });

  readonly mrcValue = computed<string | null>(() => {
    // TODO: adapt path/source
    return this.workflowDTO()?.counterpartyRating?.pgnnrCounterpartyRatingDetails
      ?.maximumCountryRating ?? null;
  });

  readonly geometricMeanValue = computed<string | null>(() => {
    // TODO: adapt path/source
    return this.workflowDTO()?.counterpartyRating?.pgnnrCounterpartyRatingDetails
      ?.geometricMeanRating ?? null;
  });

  // ---------------------------------
  // Convenience computed
  // ---------------------------------

  readonly cr = computed(() => this.ratingProposedCtrl().value);
  readonly ir = computed(() => this.intrinsicRatingProposedCtrl().value);
  readonly crSupport = computed(() => this.crSupportValue());
  readonly mrc = computed(() => this.mrcValue());
  readonly geometricMean = computed(() => this.geometricMeanValue());

  readonly comment = computed(() => (this.commentCtrl().value ?? '').trim());
  readonly hasComment = computed(() => !!this.comment());

  readonly displayFields = computed(() => !!this.ratingProposedValue());

  readonly isRatingProposedAutoFill = computed(() => {
    const supportDirection = this.supportDirectionValue();
    const supportStrength = this.supportStrengthValue();

    const isNegativeWeak =
      supportDirection === 'NEGATIVE' && supportStrength === 'WEAK';

    const isPositiveUndeterminedOrWeak =
      supportDirection === 'POSITIVE' &&
      (supportStrength === 'UNDETERMINED' || supportStrength === 'WEAK');

    const hasNoSupportEffect = !supportDirection && !supportStrength;

    return isNegativeWeak || isPositiveUndeterminedOrWeak || hasNoSupportEffect;
  });

  // ---------------------------------
  // Init
  // ---------------------------------

  ngOnInit(): void {
    this.ratingProposedCtrl()
      .valueChanges.pipe(
        startWith(this.ratingProposedCtrl().value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.ratingProposedValue.set(value);
      });

    this.intrinsicRatingProposedCtrl()
      .valueChanges.pipe(
        startWith(this.intrinsicRatingProposedCtrl().value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.intrinsicRatingProposedValue.set(value);
      });

    this.supportDirectionCtrl()
      .valueChanges.pipe(
        startWith(this.supportDirectionCtrl().value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.supportDirectionValue.set(value);
      });

    this.supportStrengthCtrl()
      .valueChanges.pipe(
        startWith(this.supportStrengthCtrl().value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.supportStrengthValue.set(value);
      });

    this.commentCtrl()
      .valueChanges.pipe(
        startWith(this.commentCtrl().value),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(value => {
        this.commentValue.set((value ?? '').trim());
      });
  }

  // ---------------------------------
  // Existing form / dto accessors
  // ---------------------------------
  // Keep your real implementation here

  readonly ratingForm = signal<any>(null);
  readonly workflowDTO = signal<any>(null);
  readonly destroyRef = inject<any>(Object as any);

  readonly isCounterpartyRating = computed(() => {
    return true;
  });

  // ---------------------------------
  // BR02 required on rating proposed
  // ---------------------------------

  readonly ratingProposedRequiredEffect = effect(() => {
    const ratingProposedCtrl = this.ratingProposedCtrl();
    const isCounterpartyRating = this.isCounterpartyRating();

    if (isCounterpartyRating) {
      ratingProposedCtrl.addValidators([Validators.required]);
    } else {
      ratingProposedCtrl.clearValidators();
    }

    ratingProposedCtrl.updateValueAndValidity({ emitEvent: false });
  });

  // ---------------------------------
  // BR04 auto-fill + readonly
  // ---------------------------------

  readonly syncRatingValueEffect = effect(
    () => {
      const ratingProposedCtrl = this.ratingProposedCtrl();
      const intrinsicRatingValue = this.intrinsicRatingProposedValue();
      const isAutoFill = this.isRatingProposedAutoFill();

      if (isAutoFill && ratingProposedCtrl.value !== intrinsicRatingValue) {
        ratingProposedCtrl.setValue(intrinsicRatingValue, { emitEvent: false });
        this.ratingProposedValue.set(intrinsicRatingValue);
      } else if (
        !isAutoFill &&
        !this.workflowDTO()?.counterpartyRating?.pgnnrCounterpartyRatingDetails
          ?.counterpartyRatingProposed
      ) {
        ratingProposedCtrl.setValue(null, { emitEvent: false });
      }
    },
    { allowSignalWrites: true }
  );

  readonly ratingProposedReadonlyEffect = effect(() => {
    const ratingProposedCtrl = this.ratingProposedCtrl();
    const isAutoFill = this.isRatingProposedAutoFill();

    if (isAutoFill && ratingProposedCtrl.enabled) {
      ratingProposedCtrl.disable({ emitEvent: false });
    } else if (!isAutoFill && ratingProposedCtrl.disabled) {
      ratingProposedCtrl.enable({ emitEvent: false });
    }

    ratingProposedCtrl.updateValueAndValidity({ emitEvent: false });
  });

  // ---------------------------------
  // Comparison helpers
  // Use your real implementation if already موجودة
  // ---------------------------------

  private better(left: string | null, right: string | null): boolean {
    if (!left || !right) {
      return false;
    }

    // TODO: replace by your real note comparison function
    // Example:
    // return this.ratingComparisonService.better(left, right);

    return false;
  }

  private worse(left: string | null, right: string | null): boolean {
    if (!left || !right) {
      return false;
    }

    // TODO: replace by your real note comparison function
    // Example:
    // return this.ratingComparisonService.worse(left, right);

    return false;
  }

  private equal(left: string | null, right: string | null): boolean {
    if (!left || !right) {
      return false;
    }

    return !this.better(left, right) && !this.worse(left, right);
  }

  private isBetween(
    value: string | null,
    boundA: string | null,
    boundB: string | null
  ): boolean {
    if (!value || !boundA || !boundB) {
      return false;
    }

    if (this.equal(value, boundA) || this.equal(value, boundB)) {
      return true;
    }

    const betweenAB = this.better(value, boundA) && this.worse(value, boundB);
    const betweenBA = this.worse(value, boundA) && this.better(value, boundB);

    return betweenAB || betweenBA;
  }

  // ---------------------------------
  // Derived comparisons
  // ---------------------------------

  readonly isCrBetterThanIr = computed(() => this.better(this.cr(), this.ir()));
  readonly isCrWorseThanIr = computed(() => this.worse(this.cr(), this.ir()));

  readonly isCrBetterThanMrc = computed(() =>
    this.better(this.cr(), this.mrc())
  );

  readonly isCrSupportBetterThanIr = computed(() =>
    this.better(this.crSupport(), this.ir())
  );

  readonly isCrSupportWorseThanIr = computed(() =>
    this.worse(this.crSupport(), this.ir())
  );

  readonly isCrSupportBetterThanMrc = computed(() =>
    this.better(this.crSupport(), this.mrc())
  );

  readonly isCrSupportWorseThanMrc = computed(() =>
    this.worse(this.crSupport(), this.mrc())
  );

  readonly isCrBelowGeometricMean = computed(() =>
    this.worse(this.cr(), this.geometricMean())
  );

  readonly isCrBetweenIrAndMrc = computed(() =>
    this.isBetween(this.cr(), this.ir(), this.mrc())
  );

  readonly isCrBetweenIrAndCrSupport = computed(() =>
    this.isBetween(this.cr(), this.ir(), this.crSupport())
  );

  // ---------------------------------
  // BR05 / BR06 + AC#8 -> AC#33
  // ---------------------------------

  readonly ratingConsistencyResult = computed<RatingValidationResult>(() => {
    const supportDirection = this.supportDirectionValue();
    const supportStrength = this.supportStrengthValue();
    const hasComment = this.hasComment();
    const isAutoFill = this.isRatingProposedAutoFill();

    if (isAutoFill) {
      return { severity: 'none', target: 'none', code: null };
    }

    // -------------------------------
    // NEGATIVE + STRONG / VERY_STRONG
    // AC#8 #9 #10 #11 #12 #13
    // -------------------------------
    const isNegativeStrongFamily =
      supportDirection === 'NEGATIVE' &&
      (supportStrength === 'STRONG' || supportStrength === 'VERY_STRONG');

    if (isNegativeStrongFamily) {
      if (this.isCrBetterThanIr()) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      return { severity: 'none', target: 'none', code: null };
    }

    // -------------------------------
    // POSITIVE + STRONG
    // AC#14 -> AC#21
    // -------------------------------
    if (supportDirection === 'POSITIVE' && supportStrength === 'STRONG') {
      if (this.isCrSupportWorseThanIr()) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      if (
        this.isCrSupportBetterThanIr() &&
        this.isCrSupportBetterThanMrc() &&
        !this.isCrBetweenIrAndMrc()
      ) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      if (
        this.isCrSupportBetterThanIr() &&
        this.isCrSupportWorseThanMrc() &&
        !this.isCrBetweenIrAndCrSupport()
      ) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      return { severity: 'none', target: 'none', code: null };
    }

    // -------------------------------
    // POSITIVE + VERY_STRONG
    // AC#22 -> AC#29
    // -------------------------------
    if (supportDirection === 'POSITIVE' && supportStrength === 'VERY_STRONG') {
      if (this.isCrSupportWorseThanIr()) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      if (
        this.isCrSupportBetterThanIr() &&
        this.isCrSupportBetterThanMrc() &&
        !this.isCrBetweenIrAndCrSupport() &&
        this.isCrBelowGeometricMean()
      ) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      if (
        this.isCrSupportBetterThanIr() &&
        this.isCrSupportWorseThanMrc() &&
        !this.isCrBetweenIrAndCrSupport()
      ) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      return { severity: 'none', target: 'none', code: null };
    }

    // -------------------------------
    // POSITIVE + ABSOLUTE
    // AC#30 -> AC#33
    // -------------------------------
    if (supportDirection === 'POSITIVE' && supportStrength === 'ABSOLUTE') {
      if (this.isCrSupportWorseThanIr()) {
        return { severity: 'none', target: 'none', code: null };
      }

      if (
        this.isCrSupportBetterThanIr() &&
        this.isCrSupportBetterThanMrc()
      ) {
        return { severity: 'none', target: 'none', code: null };
      }

      if (
        this.isCrSupportBetterThanIr() &&
        this.isCrSupportWorseThanMrc()
      ) {
        return {
          severity: hasComment ? 'warning' : 'error',
          target: 'rating',
          code: 'supportConsistency',
        };
      }

      return { severity: 'none', target: 'none', code: null };
    }

    return { severity: 'none', target: 'none', code: null };
  });

  // ---------------------------------
  // BR07 / BR08 + AC#34 / AC#35
  // ---------------------------------

  readonly mrcCommentResult = computed<RatingValidationResult>(() => {
    if (!this.isCrBetterThanMrc()) {
      return { severity: 'none', target: 'none', code: null };
    }

    return {
      severity: this.hasComment() ? 'warning' : 'error',
      target: 'comment',
      code: 'mrcCommentRequired',
    };
  });

  // ---------------------------------
  // Effects: apply rating consistency validation
  // ---------------------------------

  readonly ratingConsistencyEffect = effect(() => {
    const result = this.ratingConsistencyResult();
    const ratingCtrl = this.ratingProposedCtrl();

    const currentErrors = ratingCtrl.errors ?? {};
    const {
      supportConsistency,
      ...otherErrors
    }: Record<string, any> = currentErrors;

    if (result.target === 'rating' && result.code === 'supportConsistency') {
      ratingCtrl.setErrors({
        ...otherErrors,
        supportConsistency: result.severity,
      });

      if (result.severity === 'error') {
        this.addRatingErrorAlert('counterpartyRatingSupportConsistencyError');
        this.clearRatingWarningAlert();
      } else if (result.severity === 'warning') {
        this.addRatingWarningAlert('counterpartyRatingSupportConsistencyWarning');
        this.clearRatingErrorAlert();
      }
    } else {
      ratingCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      this.clearRatingErrorAlert();
      this.clearRatingWarningAlert();
    }

    ratingCtrl.updateValueAndValidity({ emitEvent: false });
  });

  // ---------------------------------
  // Effects: apply comment MRC validation
  // ---------------------------------

  readonly commentMrcValidationEffect = effect(() => {
    const result = this.mrcCommentResult();
    const commentCtrl = this.commentCtrl();

    const currentErrors = commentCtrl.errors ?? {};
    const {
      mrcCommentRequired,
      ...otherErrors
    }: Record<string, any> = currentErrors;

    if (result.target === 'comment' && result.code === 'mrcCommentRequired') {
      commentCtrl.setErrors({
        ...otherErrors,
        mrcCommentRequired: result.severity,
      });

      if (result.severity === 'error') {
        this.addCommentErrorAlert('counterpartyRatingAboveMrcError');
        this.clearCommentWarningAlert();
      } else if (result.severity === 'warning') {
        this.addCommentWarningAlert('counterpartyRatingAboveMrcWarning');
        this.clearCommentErrorAlert();
      }
    } else {
      commentCtrl.setErrors(Object.keys(otherErrors).length ? otherErrors : null);
      this.clearCommentErrorAlert();
      this.clearCommentWarningAlert();
    }

    commentCtrl.updateValueAndValidity({ emitEvent: false });
  });

  // ---------------------------------
  // Alerts
  // IMPORTANT:
  // the alertTextId values below must exist in WORKFLOW_ALERTS_MESSAGES
  // ---------------------------------

  private addRatingErrorAlert(alertTextId: string): void {
    const alerts: IAlert[] = [
      {
        alertTextId,
        fragmentId: 'counterpartyRating',
        anchorId: 'counterpartyRatingProposed',
      },
    ];

    this.workflowValidationService.addWorkflowAlerts('errors', alerts);
  }

  private addRatingWarningAlert(alertTextId: string): void {
    const alerts: IAlert[] = [
      {
        alertTextId,
        fragmentId: 'counterpartyRating',
        anchorId: 'counterpartyRatingProposed',
      },
    ];

    this.workflowValidationService.addWorkflowAlerts('warnings', alerts);
  }

  private clearRatingErrorAlert(): void {
    this.workflowValidationService.clearAlertsByFragmentId(
      'errors',
      'counterpartyRating'
    );
  }

  private clearRatingWarningAlert(): void {
    this.workflowValidationService.clearAlertsByFragmentId(
      'warnings',
      'counterpartyRating'
    );
  }

  private addCommentErrorAlert(alertTextId: string): void {
    const alerts: IAlert[] = [
      {
        alertTextId,
        fragmentId: 'counterpartyRating',
        anchorId: 'counterpartyRatingComment',
      },
    ];

    this.workflowValidationService.addWorkflowAlerts('errors', alerts);
  }

  private addCommentWarningAlert(alertTextId: string): void {
    const alerts: IAlert[] = [
      {
        alertTextId,
        fragmentId: 'counterpartyRating',
        anchorId: 'counterpartyRatingComment',
      },
    ];

    this.workflowValidationService.addWorkflowAlerts('warnings', alerts);
  }

  private clearCommentErrorAlert(): void {
    this.workflowValidationService.clearAlertsByFragmentId(
      'errors',
      'counterpartyRating'
    );
  }

  private clearCommentWarningAlert(): void {
    this.workflowValidationService.clearAlertsByFragmentId(
      'warnings',
      'counterpartyRating'
    );
  }
}
