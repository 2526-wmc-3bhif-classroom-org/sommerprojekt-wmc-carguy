import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
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

// Static geo lookup keyed by title/location keywords
const GEO_LOOKUP: { keyword: string; lat: number; lng: number }[] = [
  { keyword: 'Tokyo',        lat: 35.6762, lng: 139.6503 },
  { keyword: 'Shibuya',      lat: 35.6595, lng: 139.7005 },
  { keyword: 'Kyoto',        lat: 35.0116, lng: 135.7681 },
  { keyword: 'Nordschleife', lat: 50.3356, lng:   6.9475 },
  { keyword: 'Nürburgring',  lat: 50.3356, lng:   6.9475 },
  { keyword: 'Mustang',      lat: 51.5074, lng:  -0.1278 },
  { keyword: 'Ace Cafe',     lat: 51.5323, lng:  -0.2756 },
  { keyword: 'London',       lat: 51.5074, lng:  -0.1278 },
  { keyword: 'Spa',          lat: 50.4372, lng:   5.9714 },
  { keyword: 'Laguna',       lat: 36.5846, lng: -121.7529 },
  { keyword: 'Silverstone',  lat: 52.0786, lng:  -1.0169 },
  { keyword: 'Goodwood',     lat: 50.8585, lng:  -0.7418 },
  { keyword: 'Chichester',   lat: 50.8365, lng:  -0.7792 },
  { keyword: 'Monaco',       lat: 43.7384, lng:   7.4246 },
  { keyword: 'Monte Carlo',  lat: 43.7384, lng:   7.4246 },
  { keyword: 'Suzuka',       lat: 34.8431, lng: 136.5421 },
  { keyword: 'Pebble Beach', lat: 36.5856, lng: -121.9025 },
  { keyword: 'Monterey',     lat: 36.6002, lng: -121.8947 },
  { keyword: 'Brands Hatch', lat: 51.3586, lng:   0.2627 },
  { keyword: 'Kent',         lat: 51.2787, lng:   0.5217 },
  { keyword: 'Fuji',         lat: 35.3717, lng: 138.9273 },
  { keyword: 'Oyama',        lat: 35.3717, lng: 138.9273 },
  { keyword: 'Los Angeles',  lat: 34.0522, lng: -118.2437 },
  { keyword: 'Pasadena',     lat: 34.1478, lng: -118.1445 },
  { keyword: 'Rose Bowl',    lat: 34.1614, lng: -118.1676 },
  { keyword: 'Bathurst',     lat: -33.4383, lng: 149.5517 },
  { keyword: 'Mount Panorama', lat: -33.4383, lng: 149.5517 },
  { keyword: 'Sydney',       lat: -33.8688, lng: 151.2093 },
  { keyword: 'Eastern Creek', lat: -33.8088, lng: 150.8727 },
  { keyword: 'Mid-Ohio',     lat: 40.6895, lng: -82.6462 },
  { keyword: 'Atlanta',      lat: 33.7490, lng: -84.3880 },
  { keyword: 'Cape Town',    lat: -33.9249, lng:  18.4241 },
  { keyword: 'Dubai',        lat: 25.2048, lng:  55.2708 },
  { keyword: 'Rio',          lat: -22.9068, lng: -43.1729 },
  { keyword: 'Nismo',        lat: 35.3717, lng: 138.9273 },
  { keyword: 'Fushimi',      lat: 34.9671, lng: 135.7727 },
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
  private router = inject(Router);

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

  handleHostEvent() {
    if (!this.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }
    this.showCreateModal = true;
  }

  eventPinColor(ev: EventModel): string {
    const isPast = new Date(ev.eventDate).getTime() < this.now;
    const isSelected = this.selectedMapEvent?.eid === ev.eid;
    if (isPast) return '#6b7280';
    if (ev.yesCount >= 5) return '#22c55e';
    if (isSelected) return '#f59e0b';
    return '#8b5cf6';
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
      const isPast = new Date(ev.eventDate).getTime() < this.now;
      const isSelected = this.selectedMapEvent?.eid === ev.eid;

      const pinColor = isPast ? '#6b7280' : ev.yesCount >= 5 ? '#22c55e' : isSelected ? '#f59e0b' : '#8b5cf6';

      const markerHtml = `
        <div style="width:26px;height:34px;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,0.38));">
          <svg width="26" height="34" viewBox="0 0 26 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 1C7.477 1 3 5.477 3 11c0 8.5 10 22 10 22s10-13.5 10-22C23 5.477 18.523 1 13 1z"
                  fill="${pinColor}" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>
            <rect x="8" y="8.5" width="10" height="4.5" rx="2" fill="rgba(255,255,255,0.92)"/>
            <rect x="9.5" y="6.5" width="6" height="2.5" rx="1.2" fill="rgba(255,255,255,0.92)"/>
            <circle cx="10" cy="13" r="1.4" fill="${pinColor}" stroke="rgba(255,255,255,0.9)" stroke-width="0.8"/>
            <circle cx="16" cy="13" r="1.4" fill="${pinColor}" stroke="rgba(255,255,255,0.9)" stroke-width="0.8"/>
          </svg>
        </div>`;

      const icon = L.divIcon({ html: markerHtml, className: '', iconSize: [26, 34], iconAnchor: [13, 34] });
      const marker = L.marker([lat, lng], { icon })
        .addTo(this.map!)
        .bindTooltip(
          `<div style="text-align:center"><b>${ev.title}</b><br><span style="opacity:0.7;font-size:11px">${ev.location}</span></div>`,
          { direction: 'top', offset: [0, -38] }
        )
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
