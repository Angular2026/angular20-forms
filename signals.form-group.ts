import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';

@Component({
  selector: 'bnpp-workflow-input',
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule],
  templateUrl: './workflow-input.component.html',
  styleUrls: ['./workflow-input.component.scss'],
})
export class WorkflowInputComponent {
  readonly formControl = input.required<FormControl>();
  readonly placeholderKey = input.required<string>();
  readonly formFieldLabel = input.required<string>();
  readonly inputType = input<string>('text');

  protected onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    const value =
      this.inputType() === 'number'
        ? rawValue === ''
          ? null
          : input.valueAsNumber
        : rawValue;

    console.log('[WorkflowInputComponent] rawValue =', rawValue, typeof rawValue);
    console.log('[WorkflowInputComponent] parsedValue =', value, typeof value);

    this.formControl().setValue(value);
    this.formControl().markAsDirty();
  }

  protected onBlur(): void {
    this.formControl().markAsTouched();
  }

  protected displayValue(): string | number | null {
    const value = this.formControl().value;

    if (value === null || value === undefined) {
      return '';
    }

    return value;
  }
}



<mat-form-field class="w-100 workflow-input-field" appearance="outline">
  <mat-label>{{ formFieldLabel() }}</mat-label>

  <input
    matInput
    [type]="inputType() === 'number' ? 'number' : 'text'"
    [min]="inputType() === 'number' ? 1 : null"
    [value]="displayValue()"
    [placeholder]="placeholderKey()"
    [disabled]="formControl().disabled"
    (input)="onInput($event)"
    (blur)="onBlur()"
  />
</mat-form-field>




      protected onInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  const rawValue = input.value;

  const value =
    this.inputType() === 'number'
      ? rawValue === ''
        ? null
        : Number.isNaN(input.valueAsNumber)
          ? null
          : input.valueAsNumber
      : rawValue;

  this.formControl().setValue(value);
  this.formControl().markAsDirty();
  this.formControl().updateValueAndValidity();
}
