import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../services/user-service';
import { environment } from '../../environments/environment';

interface ModerationLogEntry {
  mlid: number;
  type: string;
  content: string;
  status: string;
  reason: string | null;
  provider: string;
  model: string | null;
  timestamp: string;
}

interface ModerationStats {
  total: number;
  passed: number;
  blocked: number;
  flagged: number;
  activeProvider: string;
  activeModel: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent implements OnInit {
  private userService = inject(UserService);
  private router = inject(Router);
  private http = inject(HttpClient);

  isAdmin = false;
  logs: ModerationLogEntry[] = [];
  stats: ModerationStats | null = null;
  isLoading = true;

  getHeaders() {
    const token = this.userService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token || ''}`
    });
  }

  async ngOnInit() {
    const user = this.userService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
    this.isAdmin = true;
    await this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      const [logs, stats] = await Promise.all([
        firstValueFrom(this.http.get<ModerationLogEntry[]>(`${environment.apiBaseUrl}/admin/moderation/logs`, { headers: this.getHeaders() })),
        firstValueFrom(this.http.get<ModerationStats>(`${environment.apiBaseUrl}/admin/moderation/stats`, { headers: this.getHeaders() }))
      ]);
      this.logs = logs;
      this.stats = stats;
    } catch (e) {
      console.error('Failed to load moderation admin data', e);
    } finally {
      this.isLoading = false;
    }
  }

  async clearLogs() {
    if (!confirm('Are you sure you want to clear all moderation logs?')) return;
    try {
      await firstValueFrom(this.http.post<void>(`${environment.apiBaseUrl}/admin/moderation/clear`, {}, { headers: this.getHeaders() }));
      await this.loadData();
    } catch (e) {
      console.error('Failed to clear logs', e);
    }
  }
}
