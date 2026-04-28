import { Component } from '@angular/core';
import {LoginPage} from '../login-page/login-page';
import {User} from '../../model';
import { DatePipe, NgIf } from '@angular/common';
import {UserService} from '../services/user-service';

@Component({
  selector: 'app-profile-page',
  imports: [
    LoginPage,
    DatePipe,
    NgIf
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  get loggedIn(): boolean {
    return UserService.isLoggedIn();
  }

  get currentUser(): User | null {
    return UserService.getCurrentUser();
  }

  public logout(): void {
    UserService.logout();
  }
}
