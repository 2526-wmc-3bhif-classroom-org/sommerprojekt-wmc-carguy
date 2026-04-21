import {User} from '../../model';

const API_BASE_URL = "http://localhost:3000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  // For POST requests that might return 201 Created with no body
  if (response.status === 201 || response.status === 204) return {} as T;
  return response.json();
}

export const UserService = {
  async register(user : User): Promise<void> {
    let response = await fetch(`${API_BASE_URL}/users`, {
      method: "POST",
      body: JSON.stringify(user)
    })

    return handleResponse<void>(response);
  }
}
