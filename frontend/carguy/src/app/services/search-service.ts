import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Post, User, Forum } from '../../model';
import { environment } from '../../environments/environment';

export interface SearchResults {
  posts: Post[];
  users: User[];
  communities: Forum[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private http = inject(HttpClient);

  async search(query: string): Promise<SearchResults> {
    if (!query || query.trim() === "") {
      return { posts: [], users: [], communities: [] };
    }
    return firstValueFrom(
      this.http.get<SearchResults>(`${environment.apiBaseUrl}/search?q=${encodeURIComponent(query)}`)
    );
  }
}
