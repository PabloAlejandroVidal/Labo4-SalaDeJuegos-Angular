import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import Swal from 'sweetalert2';
import { gameNames, GameService } from '../../services/game/game.service';
import { UserService } from 'app/shared/services/user/user.service';


interface slot {
  row: number,
  column: number,
  color: string | null
}
interface column {
  column: number;
  elements: slot[]
  nextToFill: slot | null,
  lastToFill: slot,
}

@Component({
  selector: 'app-conecta-cuatro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conecta-cuatro.component.html',
  styleUrl: './conecta-cuatro.component.scss'
})
export class ConectaCuatroComponent {
  rows = 6;
  cols = 7;
  board: column[] = [];
  currentTurn: 'Rojo' | 'Amarillo' = 'Rojo';
  winner: string | null = null;
  gameService: GameService = inject(GameService);
  userService: UserService = inject(UserService);
  user = this.userService.currentUser;

  constructor() {
    this.resetGame();
  }

  createBoard(rows: number, cols: number): any {
    this.board = [];

    for (let i = 0; i < cols; i++){

      const newColumn: slot[] = [];
      for (let j = 0; j < rows; j++){
        const slot: slot = {row: j, column: i, color: null};
        newColumn.push(slot);
      }

      const column: column = {
        elements: [...newColumn],
        nextToFill: newColumn[0],
        lastToFill: newColumn[rows-1],
        column: i,
      };

      this.board.push(column);
    }
  }

  resetGame() {
    this.createBoard(this.rows, this.cols);
    this.currentTurn = 'Rojo';
    this.winner = null;
  }

  makeMove(column: column) {
    //Si el juego estaterminado no se deberia poder jugar
    if (this.winner) return;

    //Si la columna esta completa no se puede seleccionar
    if (!column.nextToFill) return;

    //Se marca la columna y se devuelve la celda marcada
    const markedSlot = this.markColumn(column);
    if(markedSlot){
      //Si hay una nueva celda marcada se calcula nuevamente si se completo 4
      if (this.checkWinner(markedSlot)) {
        this.winner = this.currentTurn;
        Swal.fire('Fin del Juego!',
          `El ganador es el color: ${this.winner}`,
          'success'
        )
        if (this.user){
          this.gameService.recordConectaCuatroScore(this.user, this.winner.toLowerCase());
        }
      } else {
        this.switchTurn();
      }
    }

  }

  markColumn(column: column) {
    if (!column.nextToFill) return null;

    column.nextToFill.color = this.currentTurn;
    const markedSlot = column.nextToFill;

    if (column.nextToFill === column.lastToFill){
      column.nextToFill = null;
    }else{
      column.nextToFill = column.elements[column.nextToFill.row+1];
    }
    return markedSlot;
  }

  switchTurn() {
    this.currentTurn = this.currentTurn === 'Rojo' ? 'Amarillo' : 'Rojo';
  }

  checkWinner(markedSlot: slot): boolean {
    const directions = [
      { dr: 0, dc: 1 },  // Horizontal
      { dr: 1, dc: 0 },  // Vertical
      { dr: 1, dc: 1 },  // Diagonal \
      { dr: 1, dc: -1 }, // Diagonal /
    ];

    for (const { dr, dc } of directions) {
      let count = 1;

      // Contar en una dirección

      count += this.countInDirection(markedSlot.column, markedSlot.row, dr, dc);
      // Contar en la dirección opuesta
      count += this.countInDirection(markedSlot.column, markedSlot.row, -dr, -dc);

      if (count >= 4) {
        return true;
      }
    }

    return false;
  }

  countInDirection(rowIndex: number, colIndex: number, dr: number, dc: number): number {
    let count = 0;
    let r = rowIndex + dr;
    let c = colIndex + dc;

    while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r].elements[c]?.color === this.currentTurn) {
      count++;
      r += dr;
      c += dc;
    }

    return count;
  }
}
