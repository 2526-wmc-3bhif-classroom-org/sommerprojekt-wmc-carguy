import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EventService, EventModel, EventComment } from '../services/event-service';
import { UserService } from '../services/user-service';
import * as L from 'leaflet';

// Fix for Leaflet default marker icons in Angular builds
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = iconDefault;

// Static geo lookup keyed by title keywords
const GEO_LOOKUP: { keyword: string; lat: number; lng: number }[] = [
  { keyword: 'Tokyo',        lat: 35.6762, lng: 139.6503 },
  { keyword: 'Nordschleife', lat: 50.3356, lng:   6.9475 },
  { keyword: 'Nürburgring',  lat: 50.3356, lng:   6.9475 },
  { keyword: 'Mustang',      lat: 51.5074, lng:  -0.1278 }, // Ace Cafe London
  { keyword: 'London',       lat: 51.5074, lng:  -0.1278 },
  { keyword: 'Spa',          lat: 50.4372, lng:   5.9714 },
  { keyword: 'Laguna',       lat: 36.5846, lng: -121.7529 },
  { keyword: 'Silverstone',  lat: 52.0786, lng:  -1.0169 },
];

function getCoords(ev: EventModel): [number, number] {
  const combined = `${ev.title} ${ev.location}`;
  for (const g of GEO_LOOKUP) {
    if (combined.toLowerCase().includes(g.keyword.toLowerCase())) {
      return [g.lat, g.lng];
    }
  }
  // Deterministic scatter for unknown events
  const h = ev.eid * 7919;
  return [((h % 180) - 90) * 0.4, ((h >> 3) % 360) - 180];
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './events.component.html'
})
export class EventsComponent implements OnInit, OnDestroy {
  private eventService = inject(EventService);
  private userService = inject(UserService);

  events: EventModel[] = [];
  expandedEvents: Record<number, boolean> = {};
  activeTab: 'list' | 'map' = 'list';
  selectedMapEvent: EventModel | null = null;

  eventComments: Record<number, EventComment[]> = {};
  newCommentText: Record<number, string> = {};
  loadingComments: Record<number, boolean> = {};
  showComments: Record<number, boolean> = {};

  showCreateModal = false;
  newTitle = '';
  newDescription = '';
  newLocation = '';
  newDate = '';
  createError = '';
  isSubmitting = false;

  now = Date.now();
  private timerInterval?: any;
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;
  private markers: L.Marker[] = [];
  private themeObserver: MutationObserver | null = null;

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  getCurrentUserRsvp(event: EventModel): string | null {
    const user = this.userService.getCurrentUser();
    if (!user) return null;
    const attendee = event.attendees.find(a => a.uid === user.uid);
    return attendee ? attendee.status : null;
  }

  async ngOnInit() {
    await this.loadEvents();
    this.timerInterval = setInterval(() => { this.now = Date.now(); }, 1000);
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.map) { this.map.remove(); this.map = null; }
    if (this.themeObserver) { this.themeObserver.disconnect(); this.themeObserver = null; }
  }

  switchTab(tab: 'list' | 'map') {
    this.activeTab = tab;
    if (tab === 'map') {
      this.initMapDelayed();
    }
  }

  private initMapDelayed() {
    setTimeout(() => {
      const container = document.getElementById('leaflet-map');
      if (!container || container.offsetWidth === 0) { this.initMapDelayed(); return; }
      if (this.map) { this.map.invalidateSize(); return; }
      this.initMap();
    }, 150);
  }

  private getTileUrl(): string {
    const theme = document.documentElement.getAttribute('data-theme');
    const isDark = theme && theme !== 'light';
    return isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  }

  private initMap() {
    const container = document.getElementById('leaflet-map');
    if (!container || this.map) return;

    this.map = L.map('leaflet-map', {
      center: [30, 10],
      zoom: 2,
      zoomControl: true,
    });

    this.tileLayer = L.tileLayer(this.getTileUrl(), {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    });
    this.tileLayer.addTo(this.map);

    this.themeObserver = new MutationObserver(() => {
      if (!this.map) return;
      if (this.tileLayer) { this.tileLayer.remove(); }
      this.tileLayer = L.tileLayer(this.getTileUrl(), {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      });
      this.tileLayer.addTo(this.map);
    });
    this.themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    this.placeMarkers();
  }

  private placeMarkers() {
    if (!this.map) return;
    this.markers.forEach(m => m.remove());
    this.markers = [];

    for (const ev of this.events) {
      const [lat, lng] = getCoords(ev);

      const markerHtml = `
        <div style="
          width:28px; height:28px; border-radius:50%;
          background: hsl(258 90% 66%);
          border: 3px solid white;
          box-shadow: 0 0 14px 4px hsl(258 90% 66% / 0.6);
          display:flex; align-items:center; justify-content:center;
          font-size:10px; color:white; font-weight:900; cursor:pointer;
        ">${ev.eid}</div>`;

      const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14] });
      const marker = L.marker([lat, lng], { icon })
        .addTo(this.map!)
        .bindTooltip(`<b>${ev.title}</b><br>${ev.location}`, { direction: 'top', offset: [0, -14] })
        .on('click', () => this.selectEventOnMap(ev));

      this.markers.push(marker);
    }
  }

  selectEventOnMap(ev: EventModel) {
    this.selectedMapEvent = ev;
    if (!this.map) return;
    const [lat, lng] = getCoords(ev);
    this.map.flyTo([lat, lng], 10, { duration: 1.2 });

    // Scroll sidebar item into view
    setTimeout(() => {
      const el = document.getElementById(`map-event-${ev.eid}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }

  async loadEvents() {
    try {
      this.events = await this.eventService.getEvents();
      if (this.map) this.placeMarkers();
    } catch (e) {
      console.error('Failed to load events', e);
    }
  }

  getCountdown(eventDateStr: string): string {
    const diff = new Date(eventDateStr).getTime() - this.now;
    if (diff <= 0) return 'Event Started';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const parts: string[] = [];
    if (d > 0) parts.push(`${d}d`);
    if (h > 0 || d > 0) parts.push(`${h}h`);
    parts.push(`${m}m`);
    parts.push(`${s}s`);
    return parts.join(' ');
  }

  toggleExpand(eid: number) {
    this.expandedEvents[eid] = !this.expandedEvents[eid];
  }

  async rsvp(eid: number, status: string) {
    if (!this.isLoggedIn) return;
    try {
      await this.eventService.submitRsvp(eid, status);
      await this.loadEvents();
    } catch (e) {
      console.error('Failed to submit RSVP', e);
    }
  }

  async createEvent() {
    if (!this.newTitle.trim() || !this.newDescription.trim() || !this.newLocation.trim() || !this.newDate || this.isSubmitting) return;
    this.isSubmitting = true;
    this.createError = '';
    try {
      await this.eventService.createEvent(this.newTitle.trim(), this.newDescription.trim(), this.newLocation.trim(), this.newDate);
      this.newTitle = ''; this.newDescription = ''; this.newLocation = ''; this.newDate = '';
      this.showCreateModal = false;
      await this.loadEvents();
    } catch (e: any) {
      this.createError = e.error || e.message || 'Failed to create event.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async toggleComments(eid: number) {
    this.showComments[eid] = !this.showComments[eid];
    if (this.showComments[eid] && !this.eventComments[eid]) {
      await this.loadComments(eid);
    }
  }

  async loadComments(eid: number) {
    this.loadingComments[eid] = true;
    try {
      this.eventComments[eid] = await this.eventService.getEventComments(eid);
    } catch (e) {
      this.eventComments[eid] = [];
    } finally {
      this.loadingComments[eid] = false;
    }
  }

  async postComment(eid: number) {
    const text = (this.newCommentText[eid] || '').trim();
    if (!text || !this.isLoggedIn) return;
    try {
      await this.eventService.postEventComment(eid, text);
      this.newCommentText[eid] = '';
      await this.loadComments(eid);
    } catch (e) {
      console.error('Failed to post comment', e);
    }
  }
}
