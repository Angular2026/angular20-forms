import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const blankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value: string = control.value ?? '';
  return value.length > 0 && value.trim().length === 0 ? { required: true } : null;
};

constructor() {
    effect(() => {
      const control = this.commentFormcontrol();
      if (control.hasValidator(Validators.required) && !control.hasValidator(blankValidator)) {
        control.addValidators(blankValidator);
        control.updateValueAndValidity({ emitEvent: false });
      }
    });
  }
