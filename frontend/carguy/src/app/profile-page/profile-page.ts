import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
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
export class ProfilePage implements OnInit {
  loadedUser: User | null = null;
  private cdr = inject(ChangeDetectorRef);

  get loggedIn(): boolean {
    return UserService.isLoggedIn();
  }

  get currentUser(): User | null {
    return this.loadedUser || UserService.getCurrentUser();
  }

  async ngOnInit() {
    const user = UserService.getCurrentUser();
    if (user) {
      try {
        this.loadedUser = await UserService.getUserById(user.uid);
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Failed to load user profile stats:', error);
      }
    }
  }

  public logout(): void {
    UserService.logout();
  }
}
