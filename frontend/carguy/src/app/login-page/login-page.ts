import { Component } from '@angular/core';
import { UserService } from '../services/user-service'
import { User } from '../../model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  public username = '';
  public password = '';

  public login() {
    console.log('Login attempt with', this.username);
  }

  public register() {
    console.log('Register attempt with', this.username);
  }
}
