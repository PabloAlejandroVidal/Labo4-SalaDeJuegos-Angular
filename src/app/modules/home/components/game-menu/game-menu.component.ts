import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-game-menu',
  templateUrl: './game-menu.component.html',
  styleUrl: './game-menu.component.scss'
})
export class GameMenuComponent {
  @Input() menuItems: { label: string, action: Function }[] = [];

  onItemClick(item: { label: string, action: Function }) {
    item.action();
  }
}
