import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
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
  private router = inject(Router);

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

  createCommunity(): void {
    this.router.navigate(['/create-community']);
  }

  // Helper for the "Letter Avatar"
  getInitials(name: string): string {
    if (!name) return '';
    return name.substring(0, 2).toUpperCase();
  }

  getBrandColor(name: string): string {
    const brandColors: { [key: string]: string } = {
      'ferrari': '#D61F27',
      'lamborghini': '#D4AF37',
      'porsche': '#222222',
      'bmw': '#1C69D4',
      'audi': '#333333',
      'mercedes': '#555555',
      'ford': '#003399',
      'chevrolet': '#E0A800',
      'toyota': '#EB0A1E',
      'honda': '#E4002B',
      'nissan': '#C3002F',
      'mazda': '#E60012',
      'subaru': '#0033A0',
      'mitsubishi': '#E60012',
    };
    
    const key = name.toLowerCase();
    for (const [brand, color] of Object.entries(brandColors)) {
      if (key.includes(brand)) {
        return color;
      }
    }
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  }
}
