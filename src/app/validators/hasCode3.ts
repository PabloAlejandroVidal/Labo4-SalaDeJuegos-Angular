import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function hasCode3(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = true;
    console.log(value)

    return isValid ? null : { hasCode3: true };
  };
}
