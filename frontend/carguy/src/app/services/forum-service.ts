import {Comment, Forum, Post, User} from "../../model";

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

export const ForumService = {

  /** Get all forums */
  async getAllForums(): Promise<Forum[]> {
    const res = await fetch(`${API_BASE_URL}/forums`);
    return handleResponse<Forum[]>(res);
  },

  /** Get trending forums */
  async getTrendingForums(limit: number = 5): Promise<Forum[]> {
    const res = await fetch(`${API_BASE_URL}/forums/trending?limit=${limit}`);
    return handleResponse<Forum[]>(res);
  },

  /** Get a single forum */
  async getForumById(id: number): Promise<Forum> {
    const res = await fetch(`${API_BASE_URL}/forum/${id}`);
    return handleResponse<Forum>(res);
  },

  /** Get forums by ID */
  async getForumsByCategory(categoryId: number): Promise<Forum[]> {
    // Note: If your backend uses :postId, ensure this matches!
    const res = await fetch(`${API_BASE_URL}/forum/category/${categoryId}`);
    return handleResponse<Forum[]>(res);
  },

  /** * Create a new forum
   */
  async createForum(name: string, author: User, description?: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/forum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, author, description }),
    });
    return handleResponse<void>(res);
  },
};
