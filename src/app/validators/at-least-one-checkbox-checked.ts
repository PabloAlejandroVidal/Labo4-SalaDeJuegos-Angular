import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export const atLeastOneCheckboxChecked: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const formGroup = control as FormGroup;

  // Asegúrate de que el control es un FormGroup
  if (!formGroup || !(formGroup.controls)) {
    return null;
  }

  // Recorre los controles hijos del FormGroup
  const isAtLeastOneChecked = Object.values(formGroup.controls).some(control => control.value === true);

  // Retorna el error si ninguno está marcado
  return isAtLeastOneChecked ? null : { atLeastOneRequired: true };
};
