import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  referenceId?: number | null;
}

interface ModerationStats {
  total: number;
  passed: number;
  blocked: number;
  flagged: number;
  activeProvider: string;
  activeModel: string;
}

interface AISettings {
  provider: string;
  model: string;
  apiUrl: string;
  hasApiKey: boolean;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  settings: AISettings | null = null;
  editProvider = 'local';
  editModel = '';
  editApiKey = '';
  editApiUrl = '';
  savingSettings = false;
  settingsError = '';
  settingsSaved = false;

  readonly providers = ['local', 'gemini', 'openai', 'ollama'];

  getHeaders() {
    const token = this.userService.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token || ''}` });
  }

  async ngOnInit() {
    const user = this.userService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/']);
      return;
    }
    this.isAdmin = true;
    await Promise.all([this.loadData(), this.loadSettings()]);
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

  async loadSettings() {
    try {
      this.settings = await firstValueFrom(this.http.get<AISettings>(`${environment.apiBaseUrl}/admin/moderation/settings`, { headers: this.getHeaders() }));
      this.editProvider = this.settings?.provider || 'local';
      this.editModel = this.settings?.model || '';
      this.editApiUrl = this.settings?.apiUrl || '';
    } catch (e) {
      console.error('Failed to load AI settings', e);
    }
  }

  async saveSettings() {
    this.savingSettings = true;
    this.settingsError = '';
    this.settingsSaved = false;
    try {
      const body: any = { provider: this.editProvider, model: this.editModel, apiUrl: this.editApiUrl };
      if (this.editApiKey) body.apiKey = this.editApiKey;
      await firstValueFrom(this.http.post<void>(`${environment.apiBaseUrl}/admin/moderation/settings`, body, { headers: this.getHeaders() }));
      this.editApiKey = '';
      this.settingsSaved = true;
      await Promise.all([this.loadSettings(), this.loadData()]);
      setTimeout(() => this.settingsSaved = false, 3000);
    } catch (e: any) {
      this.settingsError = 'Failed to update settings';
    } finally {
      this.savingSettings = false;
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

  navigateToContent(log: ModerationLogEntry) {
    if (!log.referenceId) return;
    if (log.type === 'post') {
      this.router.navigate(['/post', log.referenceId]);
    } else if (log.type === 'event' || log.type === 'event_comment') {
      this.router.navigate(['/events']);
    }
  }

  isNavigable(log: ModerationLogEntry): boolean {
    return !!log.referenceId && (log.type === 'post' || log.type === 'event' || log.type === 'event_comment');
  }
}
