import {Comment, Forum, Post, User} from "../../model";

const API_BASE_URL = "http://localhost:3000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return {} as T;

  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text);
}

export const ForumService = {

  /** Get all forums */
  async getAllForums(): Promise<Forum[]> {
    const res = await fetch(`${API_BASE_URL}/forums`);
    return handleResponse<Forum[]>(res);
  },

  /** Get trending forums */
  async getTrendingForums(limit: number = 10): Promise<Forum[]> {
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
  async createForum(name: string, author: User, description?: string): Promise<{message: string, forumId: number}> {
    const res = await fetch(`${API_BASE_URL}/forum`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, author, description }),
    });
    return handleResponse<{message: string, forumId: number}>(res);
  },

  /** Update an existing forum */
  async updateForum(id: number, name: string, description?: string): Promise<{message: string}> {
    const res = await fetch(`${API_BASE_URL}/forum/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    return handleResponse<{message: string}>(res);
  },

  /** Delete a forum */
  async deleteForum(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/forum/${id}`, {
      method: "DELETE"
    });
    return handleResponse<void>(res);
  },

  async joinForum(id: number, userId: number): Promise<{message: string}> {
    const res = await fetch(`${API_BASE_URL}/forum/${id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return handleResponse<{message: string}>(res);
  },

  async leaveForum(id: number, userId: number): Promise<{message: string}> {
    const res = await fetch(`${API_BASE_URL}/forum/${id}/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    });
    return handleResponse<{message: string}>(res);
  },

  async isUserInForum(id: number, userId: number): Promise<boolean> {
    const res = await fetch(`${API_BASE_URL}/forum/${id}/member/${userId}`);
    const data = await handleResponse<{isMember: boolean}>(res);
    return data.isMember;
  }
};
