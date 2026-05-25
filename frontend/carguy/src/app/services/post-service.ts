import { Post, User, Forum } from "../../model";

const API_BASE_URL = "http://localhost:3000/api";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }
  if (response.status === 201 || response.status === 204) return {} as T;
  return response.json();
}

export const PostService = {
  async getPostsByForum(forumId: number): Promise<Post[]> {
    const res = await fetch(`${API_BASE_URL}/posts/forum/${forumId}`);
    return handleResponse<Post[]>(res);
  },

  async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    const res = await fetch(`${API_BASE_URL}/posts/trending?limit=${limit}`);
    return handleResponse<Post[]>(res);
  },

  async getPostById(id: number): Promise<Post> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}`);
    return handleResponse<Post>(res);
  },

  async getPostsByUser(userId: number): Promise<Post[]> {
    const res = await fetch(`${API_BASE_URL}/posts/user/${userId}`);
    return handleResponse<Post[]>(res);
  },

  async createPost(title: string, content: string, author: User, forum: Forum): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        content,
        author,
        forum,
        publishedAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
      }),
    });
    return handleResponse<void>(res);
  },

  async likePost(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/like`, { method: "PATCH" });
    return handleResponse<void>(res);
  },

  async unlikePost(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/unlike`, { method: "PATCH" });
    return handleResponse<void>(res);
  },

  async dislikePost(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/dislike`, { method: "PATCH" });
    return handleResponse<void>(res);
  },

  async undislikePost(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/posts/${id}/undislike`, { method: "PATCH" });
    return handleResponse<void>(res);
  },
};
