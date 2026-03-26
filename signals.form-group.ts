import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'bnpp-workflow-input-number',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './bnpp-workflow-input-number.component.html',
  styleUrls: ['./bnpp-workflow-input-number.component.scss'],
})
export class WorkflowInputNumberComponent {
  readonly formControl = input.required<FormControl<number | null>>();
  readonly placeholderKey = input.required<string>();
  readonly formFieldLabel = input.required<string>();

  // optionnel → si tu veux contrôler ça depuis le parent
  readonly min = input<number | null>(null);
  readonly max = input<number | null>(null);

  protected onBlur(event: FocusEvent): void {
    const control = this.formControl();
    control.markAsTouched();

    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    // cas vide → null
    if (rawValue === '') {
      control.setValue(null);
      control.updateValueAndValidity();
      return;
    }

    const parsedValue = Number(rawValue);

    // si nombre valide → on convertit
    if (!Number.isNaN(parsedValue)) {
      control.setValue(parsedValue);
    }

    control.updateValueAndValidity();
  }
}



<mat-form-field class="w-100 workflow-input-field" appearance="outline">
  <mat-label>{{ formFieldLabel() }}</mat-label>

  <input
    matInput
    type="number"
    [formControl]="formControl()"
    [min]="min()"
    [max]="max()"
    [placeholder]="placeholderKey()"
    (blur)="onBlur($event)"
  />

  @if (formControl().touched && formControl().hasError('required')) {
    <mat-error>{{ formFieldLabel() }} is required</mat-error>
  }
</mat-form-field>
