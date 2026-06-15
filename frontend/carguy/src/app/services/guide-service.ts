import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Guide } from '../../model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GuideService {
  private http = inject(HttpClient);

  async getGuides(): Promise<Guide[]> {
    return firstValueFrom(
      this.http.get<Guide[]>(`${environment.apiBaseUrl}/guides`)
    );
  }

  async createGuide(title: string, description: string, content: string[]): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/guide`, {
        title,
        description,
        content
      })
    );
  }
}
