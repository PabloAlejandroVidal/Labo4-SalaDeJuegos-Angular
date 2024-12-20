import { FormGroup } from "@angular/forms";

export class CheckboxGroupManager {
  private formGroup: FormGroup;
  private checkboxesGroups: string[][];

  constructor(formGroup: FormGroup, checkboxesGroups: string[][]) {
    this.formGroup = formGroup;
    this.checkboxesGroups = checkboxesGroups;
    this.initialize();
  }

  private initialize(): void {
    this.checkboxesGroups.forEach(checkboxGroup => {
      checkboxGroup.forEach((checkboxName)=>{
        const control = this.formGroup.get(checkboxName);
        control?.valueChanges.subscribe(value => {
          if (value) {
            this.excludeOthers(checkboxGroup, checkboxName);
          }
        });
      });
      });
  }

  private excludeOthers(selectedCheckboxesGroup: string[], selectedCheckbox: string): void {
    this.checkboxesGroups.forEach(checkboxGroup => {
      if (checkboxGroup === selectedCheckboxesGroup){
        return;
      }
      checkboxGroup.forEach((checkboxName)=>{
        if (checkboxName !== selectedCheckbox) {
          this.formGroup.get(checkboxName)?.setValue(false, { emitEvent: false });
        }
      });
    });
  }
}
