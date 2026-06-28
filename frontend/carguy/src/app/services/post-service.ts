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

  async createPost(title: string, content: string, author: User, forum: Forum, imageUrls?: string[], poll?: { question: string, options: string[] }): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/post`, {
        title,
        content,
        author,
        forum,
        imageUrls,
        poll,
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

  async bookmarkPost(id: number): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/posts/${id}/bookmark`, {})
    );
  }

  async unbookmarkPost(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${environment.apiBaseUrl}/posts/${id}/bookmark`)
    );
  }

  async isBookmarked(id: number): Promise<boolean> {
    const res = await firstValueFrom(
      this.http.get<{ bookmarked: boolean }>(`${environment.apiBaseUrl}/posts/${id}/bookmarked`)
    );
    return res.bookmarked;
  }

  async getBookmarkedPosts(): Promise<Post[]> {
    return firstValueFrom(
      this.http.get<Post[]>(`${environment.apiBaseUrl}/users/bookmarks`)
    );
  }

  async voteInPoll(postId: number, optionIndex: number): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/posts/${postId}/poll/vote`, { optionIndex })
    );
  }
}
