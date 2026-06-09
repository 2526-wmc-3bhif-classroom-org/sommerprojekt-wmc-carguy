import { User } from "../../model";

export interface Guide {
  id: number;
  title: string;
  description: string;
  content: string[];
  author?: User;
  publishedAt?: string;
  likes?: number;
  dislikes?: number;
}

const API_BASE_URL = "http://localhost:3000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  if (response.status === 201 || response.status === 204) return {} as T;
  return response.json();
}

export const GuideService = {
  async getGuides(): Promise<Guide[]> {
    const res = await fetch(`${API_BASE_URL}/guides`);
    return handleResponse<Guide[]>(res);
  },

  async createGuide(title: string, description: string, content: string[]): Promise<void> {
    const token = localStorage.getItem("accessToken");
    if (!token) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE_URL}/guide`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        title,
        description,
        content
      }),
    });
    return handleResponse<void>(res);
  }
};
