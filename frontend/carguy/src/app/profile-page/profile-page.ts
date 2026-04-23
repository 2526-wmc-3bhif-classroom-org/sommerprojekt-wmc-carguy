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
  public loggedIn = true;

  public currentUser: User | null;

  constructor() {
    this.currentUser = UserService.getCurrentUser();
  }
}
