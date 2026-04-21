import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  public switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  public async login() {
    this.isLoading = true;
    this.errorMessage = '';

    // TODO: Replace with actual backend auth call
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Placeholder: accept any non-empty credentials
      if (this.username && this.password) {
        this.router.navigate(['/profile']);
      } else {
        this.errorMessage = 'Please enter both username and password.';
      }
    } catch (e) {
      this.errorMessage = 'Login failed. Please try again.';
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

    // TODO: Replace with actual backend register call
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      if (this.username && this.password) {
        this.router.navigate(['/profile']);
      } else {
        this.errorMessage = 'Please fill in all fields.';
      }
    } catch (e) {
      this.errorMessage = 'Registration failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }
}
