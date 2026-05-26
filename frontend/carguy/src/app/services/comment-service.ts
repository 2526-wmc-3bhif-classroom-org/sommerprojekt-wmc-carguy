import { Comment, Post, User } from "../../model";

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

export const CommentService = {

  /** Get all comments */
  async getAllComments(): Promise<Comment[]> {
    const res = await fetch(`${API_BASE_URL}/comments`);
    return handleResponse<Comment[]>(res);
  },

  /** Get comments for a user */
  async getCommentsByUser(userId: number): Promise<Comment[]> {
    const res = await fetch(`${API_BASE_URL}/comments/user/${userId}`);
    return handleResponse<Comment[]>(res);
  },

  /** Get a single comment */
  async getCommentById(id: number): Promise<Comment> {
    const res = await fetch(`${API_BASE_URL}/comment/${id}`);
    return handleResponse<Comment>(res);
  },

  /** Get comments for a specific post */
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    // Note: If your backend uses :postId, ensure this matches!
    const res = await fetch(`${API_BASE_URL}/posts/comments/${postId}`);
    return handleResponse<Comment[]>(res);
  },

  /** Get nested replies for a comment */
  async getReplies(parentCommentId: number): Promise<Comment[]> {
    const res = await fetch(`${API_BASE_URL}/comment/comments/${parentCommentId}`);
    return handleResponse<Comment[]>(res);
  },

  /** * Create a new top-level comment
   */
  async createComment(content: string, author: User, post: Post, imageUrls?: string[]): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author, post, imageUrls }),
    });
    return handleResponse<void>(res);
  },

  /** * Create a reply to another comment
   */
  async createReply(content: string, author: User, post: Post, parentComment: Comment, imageUrls?: string[]): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/posts/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        author,
        post,
        comment: parentComment,
        imageUrls
      }),
    });
    return handleResponse<void>(res);
  },

  /** Like a comment */
  async likeComment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comments/${id}/like`, { method: "PATCH" });
    return handleResponse<void>(res);
  },

  /** Unlike a comment */
  async unlikeComment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comments/${id}/unlike`, { method: "PATCH" });
    return handleResponse<void>(res);
  },

  /** Dislike a comment */
  async dislikeComment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comments/${id}/dislike`, { method: "PATCH" });
    return handleResponse<void>(res);
  },

  /** Undislike a comment */
  async undislikeComment(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comments/${id}/undislike`, { method: "PATCH" });
    return handleResponse<void>(res);
  }
};
