import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Post, User, Forum } from '../../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private http = inject(HttpClient);

  async getPostsByForum(forumId: number): Promise<Post[]> {
    return firstValueFrom(
      this.http.get<Post[]>(`${environment.apiBaseUrl}/posts/forum/${forumId}`)
    );
  }

  async getTrendingPosts(limit: number = 10): Promise<Post[]> {
    return firstValueFrom(
      this.http.get<Post[]>(`${environment.apiBaseUrl}/posts/trending?limit=${limit}`)
    );
  }

  async getPostById(id: number): Promise<Post> {
    return firstValueFrom(
      this.http.get<Post>(`${environment.apiBaseUrl}/posts/${id}`)
    );
  }

  async getPostsByUser(userId: number): Promise<Post[]> {
    return firstValueFrom(
      this.http.get<Post[]>(`${environment.apiBaseUrl}/posts/user/${userId}`)
    );
  }

  async createPost(title: string, content: string, author: User, forum: Forum, imageUrls?: string[]): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/post`, {
        title,
        content,
        author,
        forum,
        imageUrls,
        publishedAt: new Date().toISOString(),
        likes: 0,
        dislikes: 0,
      })
    );
  }

  async likePost(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/posts/${id}/like`, {})
    );
  }

  async unlikePost(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/posts/${id}/unlike`, {})
    );
  }

  async dislikePost(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/posts/${id}/dislike`, {})
    );
  }

  async undislikePost(id: number): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${environment.apiBaseUrl}/posts/${id}/undislike`, {})
    );
  }
}
