import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function numbersOnlyValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const isValid = /^[0-9]+$/.test(value); // Expresión regular que verifica si solo hay letras

    return isValid ? null : { numbersOnly: true }; // Devuelve null si es válido, o un error si no lo es
  };
}
