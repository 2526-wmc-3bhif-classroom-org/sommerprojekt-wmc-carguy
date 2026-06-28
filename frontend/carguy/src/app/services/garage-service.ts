import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { GarageVehicle } from '../../model';
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root'
})
export class GarageService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  getHeaders() {
    const token = this.userService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  async getUserGarage(uid: number): Promise<GarageVehicle[]> {
    return firstValueFrom(
      this.http.get<GarageVehicle[]>(`${environment.apiBaseUrl}/users/${uid}/garage`)
    );
  }

  async addVehicle(make: string, model: string, year: number, mods?: string, imageUrl?: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${environment.apiBaseUrl}/users/garage`,
        { make, model, year, mods, imageUrl },
        { headers: this.getHeaders() }
      )
    );
  }

  async deleteVehicle(gvid: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(
        `${environment.apiBaseUrl}/users/garage/${gvid}`,
        { headers: this.getHeaders() }
      )
    );
  }
}
