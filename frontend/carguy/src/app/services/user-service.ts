const API_BASE_URL = "http://localhost:3000/api";

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

    return data;
  },

  async register(username: string, password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    await handleResponse<{ message: string }>(response);
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

  getCurrentUser(): { username: string; role: string } | null {
    if (!this.isLoggedIn()) return null;
    const claims = localStorage.getItem("userClaims");
    return claims ? JSON.parse(claims) : null;
  },

  logout(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userClaims");
    localStorage.removeItem("expiresAt");
  },
};
