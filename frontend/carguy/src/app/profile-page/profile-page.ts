import { Component } from '@angular/core';
import {LoginPage} from '../login-page/login-page';
import {User} from '../../model';

@Component({
  selector: 'app-profile-page',
  imports: [
    LoginPage
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage {
  public loggedIn = false

  public currentUser: User | null = null;

  constructor() {
  }
}
