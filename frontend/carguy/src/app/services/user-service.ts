import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../../model';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  userClaims: { username: string; role: string };
  expiresAt: string;
  accessToken: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private curUser: User | null = null;

  async login(username: string, password: string): Promise<LoginResponse> {
    const data = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/login`, { username, password })
    );

    // Store auth data in localStorage
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userClaims", JSON.stringify(data.userClaims));
    localStorage.setItem("expiresAt", data.expiresAt);
    localStorage.setItem("userName", data.userClaims.username);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    this.curUser = data.user;

    return data;
  }

  async register(publicname: string, username: string, password: string): Promise<void> {
    const data = await firstValueFrom(
      this.http.post<LoginResponse>(`${environment.apiBaseUrl}/register`, { publicname, username, password })
    );

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userClaims", JSON.stringify(data.userClaims));
    localStorage.setItem("expiresAt", data.expiresAt);
    localStorage.setItem("userName", data.userClaims.username);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    this.curUser = data.user;
  }

  getToken(): string | null {
    const token = localStorage.getItem("accessToken");
    const expiresAt = localStorage.getItem("expiresAt");

    if (!token || !expiresAt) return null;

    // Check if token is expired
    if (new Date(expiresAt).getTime() < Date.now()) {
      this.logout();
      return null;
    }

    return token;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  getCurrentUser(): User | null {
    if (!this.isLoggedIn()) {
      this.curUser = null; // Explicitly set curUser to null if not logged in
      return null;
    }
    if (!this.curUser) {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        try {
          this.curUser = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse currentUser from localStorage", e);
          this.curUser = null; // Ensure curUser is null on parsing error
        }
      }
    }
    return this.curUser;
  }

  async getUserById(id: number): Promise<User> {
    return firstValueFrom(
      this.http.get<User>(`${environment.apiBaseUrl}/user/${id}`)
    );
  }

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userClaims");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("userName");
    localStorage.removeItem("currentUser");
    this.curUser = null;
  }

  async editUserInfo(oldUser: User, newUser: User): Promise<User> {
    const response = await firstValueFrom(
      this.http.post<{ user: User, accessToken?: string, userClaims?: any, expiresAt?: string }>(`${environment.apiBaseUrl}/update`, {
        username: oldUser.username,
        newUsername: newUser.username,
        newPublicName: newUser.publicname,
        newDescription: newUser.description,
        newImage: newUser.image,
        newTitle: newUser.title
      })
    );

    if (response.accessToken) {
      localStorage.setItem("accessToken", response.accessToken);
    }
    if (response.userClaims) {
      localStorage.setItem("userClaims", JSON.stringify(response.userClaims));
      localStorage.setItem("userName", response.userClaims.username);
    }
    if (response.expiresAt) {
      localStorage.setItem("expiresAt", response.expiresAt);
    }

    localStorage.setItem("currentUser", JSON.stringify(response.user));
    this.curUser = response.user;
    return response.user;
  }
}
