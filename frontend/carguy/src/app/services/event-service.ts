import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserService } from './user-service';

export interface Attendee {
  uid: number;
  username: string;
  status: string;
}

export interface EventComment {
  ecid: number;
  eid: number;
  uid: number;
  username: string;
  content: string;
  publishedAt: string;
}

export interface EventModel {
  eid: number;
  title: string;
  description: string;
  location: string;
  eventDate: string;
  hostUid: number;
  hostUsername: string;
  lat: number | null;
  lng: number | null;
  yesCount: number;
  noCount: number;
  maybeCount: number;
  attendees: Attendee[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  getHeaders() {
    const token = this.userService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  async getEvents(): Promise<EventModel[]> {
    return firstValueFrom(
      this.http.get<EventModel[]>(`${environment.apiBaseUrl}/events`)
    );
  }

  async createEvent(title: string, description: string, location: string, eventDate: string, lat?: number | null, lng?: number | null): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${environment.apiBaseUrl}/events`,
        { title, description, location, eventDate, lat, lng },
        { headers: this.getHeaders() }
      )
    );
  }

  async submitRsvp(eid: number, status: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${environment.apiBaseUrl}/events/${eid}/rsvp`,
        { status },
        { headers: this.getHeaders() }
      )
    );
  }

  async getEventComments(eid: number): Promise<EventComment[]> {
    return firstValueFrom(
      this.http.get<EventComment[]>(`${environment.apiBaseUrl}/events/${eid}/comments`)
    );
  }

  async postEventComment(eid: number, content: string): Promise<void> {
    await firstValueFrom(
      this.http.post<void>(
        `${environment.apiBaseUrl}/events/${eid}/comments`,
        { content },
        { headers: this.getHeaders() }
      )
    );
  }
}
