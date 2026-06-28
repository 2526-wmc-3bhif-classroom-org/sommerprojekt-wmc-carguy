import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Shout } from '../../model';
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class ShoutService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  getHeaders() {
    const token = this.userService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  async getRecentShouts(): Promise<Shout[]> {
    return firstValueFrom(
      this.http.get<Shout[]>(`${environment.apiBaseUrl}/shouts`)
    );
  }

  async postShout(content: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${environment.apiBaseUrl}/shouts`,
        { content },
        { headers: this.getHeaders() }
      )
    );
  }

  async deleteShout(sid: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(
        `${environment.apiBaseUrl}/shouts/${sid}`,
        { headers: this.getHeaders() }
      )
    );
  }
}
