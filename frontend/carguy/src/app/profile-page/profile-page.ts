import { Component, ChangeDetectorRef } from '@angular/core';
import { LoginPage } from '../login-page/login-page';
import { User } from '../../model';
import { DatePipe, NgIf } from '@angular/common';
import { UserService } from '../services/user-service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  imports: [
    LoginPage,
    DatePipe,
    NgIf,
    FormsModule
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})

export class ProfilePage {
  public loggedIn = false;
  public isEditing = false;

  public currentUser: User | null;
  public editPublicName: string = '';
  public editUsername: string = '';
  public editDescription: string = '';


  public isSaving = false;

  constructor(private cdr: ChangeDetectorRef) {
    this.loggedIn = UserService.isLoggedIn();
    this.currentUser = UserService.getCurrentUser();
    if (this.currentUser) {
      this.editPublicName = this.currentUser.publicname;
      this.editUsername = this.currentUser.username;
      this.editDescription = this.currentUser.description || '';
    }
  }

  toggleEdit() {
    if (this.currentUser) {
      this.editPublicName = this.currentUser.publicname;
      this.editUsername = this.currentUser.username;
      this.editDescription = this.currentUser.description || '';
    }
    this.isEditing = true;
  }

  async saveProfile() {
    console.log("Saving called");

    if (this.currentUser) {
      this.isSaving = true;

      const updatedUser: User = {
        ...this.currentUser,
        publicname: this.editPublicName,
        username: this.editUsername,
        description: this.editDescription,
      }

      try {
        console.log("calling editUser with: ", this.currentUser, updatedUser);
        this.currentUser = await UserService.editUserInfo(this.currentUser, updatedUser);
        console.log("updated user info: ", this.currentUser);
        this.isEditing = false;
      } catch (err) {
        console.error("failed to update user: ", err);
      } finally {
        this.isSaving = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    } else {
      console.log("Failed because no current user");
    }
  }

  abortEdit() {
    if (this.currentUser) {
      this.editPublicName = this.currentUser.publicname;
      this.editUsername = this.currentUser.username;
      this.editDescription = this.currentUser.description || '';
    }
    this.isEditing = false;
  }
}
