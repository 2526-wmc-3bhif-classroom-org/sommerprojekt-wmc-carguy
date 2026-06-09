import { Component, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user-service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})

export class LoginPage {
  @ViewChild('registerForm') registerForm!: NgForm;
  @ViewChild('loginForm') loginForm!: NgForm;

  public activeTab: 'login' | 'register' = 'login';
  public username = '';
  public password = '';
  public confirmPassword = '';
  public isLoading = false;
  public errorMessage = '';
  protected publicname = '';

  constructor(private router: Router, private cdr: ChangeDetectorRef) {}

  public switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMessage = '';
  }

  public async login() {
    this.errorMessage = '';

    if (!this.loginForm.valid) {
      this.errorMessage = 'Please fill out all required fields.';
      Object.keys(this.loginForm.controls).forEach(field => {
        const control = this.loginForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      this.cdr.detectChanges();
      return;
    }

    this.isLoading = true;
    try {
      await UserService.login(this.username, this.password);
      this.router.navigate(['/profile']);
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Login failed. Please try again.';
      this.cdr.detectChanges();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  public async register() {
    this.errorMessage = '';

    if (!this.registerForm.valid) {
      this.errorMessage = 'Please fill out all required fields correctly.';
      Object.keys(this.registerForm.controls).forEach(field => {
        const control = this.registerForm.controls[field];
        control.markAsTouched({ onlySelf: true });
      });
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    try {
      await UserService.register(this.publicname, this.username, this.password);
      // Auto-login after successful registration
      await UserService.login(this.username, this.password);
      this.router.navigate(['/profile']);
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Registration failed. Please try again.';
      this.cdr.detectChanges();
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }
}
