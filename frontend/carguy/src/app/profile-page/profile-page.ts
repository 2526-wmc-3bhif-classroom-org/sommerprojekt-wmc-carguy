import { Component } from '@angular/core';
import {LoginPage} from '../login-page/login-page';
import {User} from '../../model';
import { DatePipe, NgIf } from '@angular/common';

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

  public currentUser: User | null = {
    uid: 1,
    username: 'carguy123',
    publicName: 'Julian H.',
    role: 'user',
    description: 'Enthusiast of classic sports cars and JDM legends. Always looking for the next project car.',
    title: 'Gearhead',
    createdAt: new Date('2023-01-15T10:00:00'),
    posts: [],
    comments: []
  };

  constructor() {
  }
}
