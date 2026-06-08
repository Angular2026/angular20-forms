import { Component, inject, input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MaterialModule } from '@shared/material/material.module';
import { WorkFlowSelectionComponent } from '@workflow/components/workflow-selection/workflow-selection.component';
import { WorkflowCommentComponent } from '@workflow/components/workflow-comment/workflow-comment.component';
import { InheritanceService } from '../../services/inheritance.service';
import { WorkFlowValidationService } from '@workflow/services/workflow-validation.service';
import { RatingRelation } from '../../models/rating-relation.model';
import { SelectionOption } from '@workflow/models/selection-option.model';

@Component({
  selector: 'bnpp-treasury-center',
  templateUrl: './treasury-center.component.html',
  imports: [MaterialModule, WorkFlowSelectionComponent, WorkflowCommentComponent],
  standalone: true,
})
export class TreasuryCenterComponent implements OnInit {

  // ─── Inputs ────────────────────────────────────────────────────────────────
  currentSubsidiary    = input<RatingRelation>();
  subsidiaryRmpId      = input.required<string>();
  parentRmpId          = input.required<string>();
  inheritanceForm      = input.required<FormGroup>();
  eligibilityOptions   = input.required<SelectionOption[]>();

  // ─── Injections ────────────────────────────────────────────────────────────
  private readonly inheritanceService       = inject(InheritanceService);
  private readonly formBuilder              = inject(FormBuilder);
  private readonly workFlowValidationService = inject(WorkFlowValidationService);

  // ─── Fields (dans l'ordre d'affichage progressif) ──────────────────────────
  readonly fields = [
    'isTreasuryCenterOwnedByBusinessGroup',
    'isTreasuryCenterStructuredAsSeparateEntity',
    'hasTreasuryCenterOnlyCentralizingBusinessGroup',
  ] as const;

  protected readonly commentPlaceholder = $localize`:@@FER_07222NEXT-2820: global refactor`;

  // ─── Validator custom : required UNIQUEMENT si null / undefined ─────────────
  private readonly requiredIfNoSelection = (control: AbstractControl) =>
    control.value === null || control.value === undefined
      ? { required: true }
      : null;

  // ─── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.addValidatorsTreasuryCenterEligibility();
  }

  // ─── Sélection d'une option Yes / No ────────────────────────────────────────
  setSelection(value: any, fieldName: string): void {
    const control = this.inheritanceForm()?.get(`subsidiary.${fieldName}`);
    if (!control) return;

    control.patchValue(value);

    if (fieldName) {
      this.resetSubsequentFields(fieldName);
      control.markAsPristine();
    }

    if (value === false) {
      // ── Cas "No" : alerte métier + validator d'erreur ─────────────────────
      this.workFlowValidationService.addWorkflowAlerts('errors', [
        {
          alertTextId: fieldName + 'Error',
          anchorId: fieldName,
          fragmentId: 'counterpartyRating',
        },
      ]);

      control.clearValidators();
      control.addValidators([
        this.requiredIfNoSelection,
        () => ({ [`${fieldName}Error`]: true }),
      ]);
      control.updateValueAndValidity();

    } else {
      // ── Cas "Yes" : on efface l'alerte et les erreurs, on garde required ──
      this.workFlowValidationService.clearAlertsByAnchorId('errors', fieldName);

      control.clearValidators();
      control.addValidators([this.requiredIfNoSelection]);
      control.setErrors(null);
      control.updateValueAndValidity();

      // Active le required sur le champ suivant qui vient d'apparaître
      this.activateRequiredOnNextField(fieldName);
    }
  }

  // ─── Active le required sur le prochain champ visible ───────────────────────
  private activateRequiredOnNextField(currentFieldName: string): void {
    const currentIndex = this.fields.indexOf(currentFieldName as typeof this.fields[number]);
    const nextField = this.fields[currentIndex + 1];

    if (!nextField) return; // dernier champ, rien à faire

    const nextControl = this.inheritanceForm()
      ?.get('subsidiary')
      ?.get(nextField) as AbstractControl | null;

    if (nextControl) {
      nextControl.clearValidators();
      nextControl.addValidators([this.requiredIfNoSelection]);
      nextControl.updateValueAndValidity({ emitEvent: false });
    }
  }

  // ─── Initialisation : seul le 1er champ est visible au départ ───────────────
  private addValidatorsTreasuryCenterEligibility(): void {
    const subsidiary = this.inheritanceForm()?.get('subsidiary') as FormGroup | null;
    if (!subsidiary) return;

    this.fields.forEach((field, index) => {
      const control = subsidiary.get(field);
      if (!control) return;

      control.clearValidators();
      control.setErrors(null);

      if (index === 0) {
        // Premier champ toujours visible → required dès le départ
        control.addValidators([this.requiredIfNoSelection]);
      }
      // Les champs suivants n'ont pas de validator tant qu'ils ne sont pas visibles.
      // Ils recevront leur required via activateRequiredOnNextField().

      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  // ─── Reset des champs suivants quand on change une réponse ──────────────────
  resetSubsequentFields(changedField: string): void {
    // ⚠️ Bug corrigé : changedIndex déclaré AVANT la boucle
    const changedIndex = this.fields.indexOf(changedField as typeof this.fields[number]);
    const subsidiary = this.inheritanceForm()?.get('subsidiary') as FormGroup | null;

    for (let i = changedIndex + 1; i < this.fields.length; i++) {
      const field = this.fields[i];
      const control = subsidiary?.get(field);

      if (control) {
        control.clearValidators();
        control.setErrors(null);
        control.reset(null, { emitEvent: false });
        control.updateValueAndValidity({ emitEvent: false });
      }

      this.workFlowValidationService.clearAlertsByAnchorId('errors', field);
    }
  }
}
