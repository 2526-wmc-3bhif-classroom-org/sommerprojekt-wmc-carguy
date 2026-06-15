import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Comment, Post, User } from '../../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);

  /** Get all comments */
  async getAllComments(): Promise<Comment[]> {
    return firstValueFrom(
      this.http.get<Comment[]>(`${environment.apiBaseUrl}/comments`)
    );
  }

  /** Get comments for a user */
  async getCommentsByUser(userId: number): Promise<Comment[]> {
    return firstValueFrom(
      this.http.get<Comment[]>(`${environment.apiBaseUrl}/comments/user/${userId}`)
    );
  }

  /** Get a single comment */
  async getCommentById(id: number): Promise<Comment> {
    return firstValueFrom(
      this.http.get<Comment>(`${environment.apiBaseUrl}/comment/${id}`)
    );
  }

  /** Get comments for a specific post */
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return firstValueFrom(
      this.http.get<Comment[]>(`${environment.apiBaseUrl}/posts/comments/${postId}`)
    );
  }

  /** Get nested replies for a comment */
  async getReplies(parentCommentId: number): Promise<Comment[]> {
    return firstValueFrom(
      this.http.get<Comment[]>(`${environment.apiBaseUrl}/comment/comments/${parentCommentId}`)
    );
  }

  /** Create a new top-level comment */
  async createComment(content: string, author: User, post: Post, imageUrls?: string[]): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/comment`, { content, author, post, imageUrls })
    );
  }

  /** Create a reply to another comment */
  async createReply(content: string, author: User, post: Post, parentComment: Comment, imageUrls?: string[]): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/posts/comments`, {
        content,
        author,
        post,
        comment: parentComment,
        imageUrls
      })
    );
  }

  /** Like a comment */
  async likeComment(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/comments/${id}/like`, {})
    );
  }

  /** Unlike a comment */
  async unlikeComment(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/comments/${id}/unlike`, {})
    );
  }

  /** Dislike a comment */
  async dislikeComment(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/comments/${id}/dislike`, {})
    );
  }

  /** Undislike a comment */
  async undislikeComment(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/comments/${id}/undislike`, {})
    );
  }
}
