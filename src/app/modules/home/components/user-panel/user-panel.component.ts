import { Component, EventEmitter, inject, Output } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/shared/services/user/user.service';

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrl: './user-panel.component.scss'
})
export class UserPanelComponent {
  btnStatus: boolean = false;
  @Output () btnClicked: EventEmitter<boolean> = new EventEmitter();

  userService: UserService = inject(UserService);
  router: Router = inject(Router);
  user: string = '';
  numberOfLogins: number = 0;
  lastAccess: Date | null = null;


  constructor(){
    this.userService.observeCurrentUser().subscribe((user)=>{
      this.user = user?.email || '';

      this.userService.getNumberOfLogins(this.user).subscribe((logins)=>{
        this.numberOfLogins = logins
      })

      this.userService.observeLastestLogin(this.user).subscribe((data)=>{
        this.lastAccess = data?.loginDate.toDate() || null;

      })
    });

  }

  logout(){
    this.userService.logOutUser();
  }

  onClick() {
    this.btnStatus = !this.btnStatus;
    this.btnClicked.emit(this.btnStatus);
  }
}
