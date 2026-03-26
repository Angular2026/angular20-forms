<bnpp-workflow-input
  class="w-100"
  [formControl]="$any(getControl(field.key))"
  [formFieldLabel]="field.placeholder"
  [placeholderKey]="field.placeholder"
  [inputType]="'number'"
></bnpp-workflow-input>



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
    
