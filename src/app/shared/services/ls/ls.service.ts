import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LsService {

  public getEmail() {
    const users = localStorage.getItem("email");
    if(users){
      return JSON.parse(users);
    }
    return null;
  }

  public setEmail(email: any) {
    const emailStringified = JSON.stringify(email);
    localStorage.setItem("email", emailStringified);
  }

}
