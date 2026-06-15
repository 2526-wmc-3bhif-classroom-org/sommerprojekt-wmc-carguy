import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Forum, ForumCategory, User } from '../../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private http = inject(HttpClient);

  /** Get all forums */
  async getAllForums(): Promise<Forum[]> {
    return firstValueFrom(
      this.http.get<Forum[]>(`${environment.apiBaseUrl}/forums`)
    );
  }

  /** Get trending forums */
  async getTrendingForums(limit: number = 10): Promise<Forum[]> {
    return firstValueFrom(
      this.http.get<Forum[]>(`${environment.apiBaseUrl}/forums/trending?limit=${limit}`)
    );
  }

  /** Get a single forum */
  async getForumById(id: number): Promise<Forum> {
    return firstValueFrom(
      this.http.get<Forum>(`${environment.apiBaseUrl}/forum/${id}`)
    );
  }

  /** Get forums by category */
  async getForumsByCategory(categoryId: number): Promise<Forum[]> {
    return firstValueFrom(
      this.http.get<Forum[]>(`${environment.apiBaseUrl}/forum/category/${categoryId}`)
    );
  }

  /** Create a new forum */
  async createForum(name: string, author: User, description?: string): Promise<{message: string, forumId: number}> {
    return firstValueFrom(
      this.http.post<{message: string, forumId: number}>(`${environment.apiBaseUrl}/forum`, { name, author, description })
    );
  }

  /** Update an existing forum */
  async updateForum(id: number, name: string, description?: string): Promise<{message: string}> {
    return firstValueFrom(
      this.http.put<{message: string}>(`${environment.apiBaseUrl}/forum/${id}`, { name, description })
    );
  }

  /** Delete a forum */
  async deleteForum(id: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${environment.apiBaseUrl}/forum/${id}`)
    );
  }

  async joinForum(id: number, userId: number): Promise<{message: string}> {
    return firstValueFrom(
      this.http.post<{message: string}>(`${environment.apiBaseUrl}/forum/${id}/join`, { userId })
    );
  }

  async leaveForum(id: number, userId: number): Promise<{message: string}> {
    return firstValueFrom(
      this.http.post<{message: string}>(`${environment.apiBaseUrl}/forum/${id}/leave`, { userId })
    );
  }

  async isUserInForum(id: number, userId: number): Promise<boolean> {
    const data = await firstValueFrom(
      this.http.get<{isMember: boolean}>(`${environment.apiBaseUrl}/forum/${id}/member/${userId}`)
    );
    return data.isMember;
  }

  /** Get all forum categories */
  async getAllCategories(): Promise<ForumCategory[]> {
    return firstValueFrom(
      this.http.get<ForumCategory[]>(`${environment.apiBaseUrl}/categories`)
    );
  }

  /** Get joined forums */
  async getJoinedForums(): Promise<Forum[]> {
    return firstValueFrom(
      this.http.get<Forum[]>(`${environment.apiBaseUrl}/forums/joined`)
    );
  }
}
