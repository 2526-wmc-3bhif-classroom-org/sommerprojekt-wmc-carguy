import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user-service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  public activeTab: 'login' | 'register' = 'login';
  public username = '';
  public password = '';
  public confirmPassword = '';
  public isLoading = false;
  public errorMessage = '';
  protected publicname = '';

  constructor(private router: Router) {}

  public switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  public async login() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await UserService.login(this.username, this.password);
      this.router.navigate(['/profile']);
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  public async register() {
    this.isLoading = true;
    this.errorMessage = '';

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isLoading = false;
      return;
    }

    try {
      await UserService.register(this.publicname, this.username, this.password);
      // Auto-login after successful registration
      await UserService.login(this.username, this.password);
      this.router.navigate(['/profile']);
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
