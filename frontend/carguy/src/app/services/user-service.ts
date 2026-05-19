import {User} from '../../model';

const API_BASE_URL = "http://localhost:3000/api";

/*async getCurrentUserProfile(): Promise<User | null> {
  const token = this.getToken();
  if (!token) return null;

  try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) return null;

      const response = await fetch(`${API_BASE_URL}/profile`, {
          headers: { "Authorization": `Bearer ${token}` },
      });
      return await handleResponse<User>(response);

  } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return null;
      }
  }
}*/

let curUser: User | null;

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || `Request failed with status ${response.status}`;
    } catch {
      errorMessage = await response.text() || `Request failed with status ${response.status}`;
    }
    throw new Error(errorMessage);
  }
  if (response.status === 204) return {} as T;
  return response.json();
}

export interface LoginResponse {
  userClaims: { username: string; role: string };
  expiresAt: string;
  accessToken: string;
  user: User;
}

export const UserService = {

  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await handleResponse<LoginResponse>(response);

    // Store auth data in localStorage
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userClaims", JSON.stringify(data.userClaims));
    localStorage.setItem("expiresAt", data.expiresAt);
    localStorage.setItem("userName", data.userClaims.username);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    curUser = data.user;

    return data;
  },

  async register(publicname: string, username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({publicname, username, password }),
    });

    const data: LoginResponse = await handleResponse<LoginResponse>(response);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("userClaims", JSON.stringify(data.userClaims));
    localStorage.setItem("expiresAt", data.expiresAt);
    localStorage.setItem("userName", data.userClaims.username);
    localStorage.setItem("currentUser", JSON.stringify(data.user));

    curUser = data.user;
  },

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
  },

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  },

  getCurrentUser(): User | null {
    if (!this.isLoggedIn()) return null;
    if (!curUser) {
      const stored = localStorage.getItem("currentUser");
      if (stored) {
        try {
          curUser = JSON.parse(stored);
        } catch (e) {}
      }
    }
    return curUser || null;
  },

  async getUserById(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/user/${id}`);
    return handleResponse<User>(response);
  },

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userClaims");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("userName");
    localStorage.removeItem("currentUser");
    curUser = null;
  },
};
