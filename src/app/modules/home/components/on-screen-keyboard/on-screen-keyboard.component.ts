import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-on-screen-keyboard',
  templateUrl: './on-screen-keyboard.component.html',
  styleUrl: './on-screen-keyboard.component.scss'
})
export class OnScreenKeyboardComponent {
  @Input() disabledKeys: string[] = [];
  @Output() keyPress = new EventEmitter<string>();


  keysLines = [['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
   ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
   ['Z', 'X', 'C', 'V', 'B', 'N', 'M']];

  isKeyDisabled(key: string): boolean {
    return this.disabledKeys.includes(key);
  }

  onKeyClick(key: string): void {
    if (!this.isKeyDisabled(key)) {
      this.keyPress.emit(key);
    }
  }
}
