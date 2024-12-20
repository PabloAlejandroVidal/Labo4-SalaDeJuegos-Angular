import { NgClass } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-menu',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toggle-menu.component.html',
  styleUrl: './toggle-menu.component.scss'
})
export class ToggleMenuComponent {
  isMenuActive: boolean = false;
  @Output() btnPress = new EventEmitter<boolean>();

  toggleMenu() {
    this.isMenuActive = !this.isMenuActive;
    this.btnPress.emit(this.isMenuActive);
  }
}
