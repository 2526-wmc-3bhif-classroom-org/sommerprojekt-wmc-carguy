import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { Forum } from '../../model';

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './communities-directory.html'
})
export class CommunitiesRepository implements OnInit {
  featured: Forum[] = [];
  all: Forum[] = [];
  categories: any[] = [];
  trending: any[] = [];

  count = 0;
  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    try {
      this.all = await ForumService.getAllForums();
      this.featured = this.all.slice(0, 4); // Just show a few for featured
      this.categories = this.all; // Maybe mock categories or leave as is
      this.trending = await ForumService.getTrendingForums(5);
      this.count = this.all.length;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load forums', error);
    }
  }

  // Helper for the "Letter Avatar"
  getInitials(name: string): string {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  }
}
