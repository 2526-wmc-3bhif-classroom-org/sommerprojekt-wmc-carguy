import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForumService } from '../services/forum-service';
import { Forum } from '../../model';

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommonModule],
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
      this.featured = this.all;
      this.categories = this.all;
      this.trending = this.all;
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
