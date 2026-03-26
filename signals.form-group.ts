<mat-form-field class="w-100 workflow-input-field" appearance="outline">
  <mat-label>{{ formFieldLabel() }}</mat-label>

  <input
    matInput
    [formControl]="formControl()"
    [type]="inputType() === 'number' ? 'number' : 'text'"
    [min]="inputType() === 'number' ? 1 : null"
    [placeholder]="placeholderKey()"
    (input)="onInput($event)"
    (blur)="onBlur()"
  />

  @if (formControl().touched && formControl().hasError('required')) {
    <mat-error>{{ formFieldLabel() }} is required</mat-error>
  }
</mat-form-field>



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
    if (this.inputType() !== 'number') {
      return;
    }

    const input = event.target as HTMLInputElement;
    const rawValue = input.value;

    const value =
      rawValue === ''
        ? null
        : Number.isNaN(input.valueAsNumber)
          ? null
          : input.valueAsNumber;

    this.formControl().setValue(value, { emitEvent: false });
    this.formControl().markAsDirty();
    this.formControl().updateValueAndValidity({ emitEvent: false });
  }

  protected onBlur(): void {
    this.formControl().markAsTouched();
    this.formControl().updateValueAndValidity({ emitEvent: false });
  }
}
    
