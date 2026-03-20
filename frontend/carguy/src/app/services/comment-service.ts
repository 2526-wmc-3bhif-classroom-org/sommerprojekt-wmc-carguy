import { Comment, Post, User } from "../../model";

const API_BASE_URL = "http://localhost:3000";

/** * Helper to handle fetch responses and throw clear errors
 */
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
  async createComment(content: string, author: User, post: Post): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, author, post }),
    });
    return handleResponse<void>(res);
  },

  /** * Create a reply to another comment
   */
  async createReply(content: string, author: User, post: Post, parentComment: Comment): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/posts/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        author,
        post,
        comment: parentComment
      }),
    });
    return handleResponse<void>(res);
  }
};
