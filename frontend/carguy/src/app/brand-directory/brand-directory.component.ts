import {ChangeDetectorRef, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { Forum, Post } from '../../model';

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-directory.component.html',
  styleUrls: ['./brand-directory.component.css']
})
export class BrandDirectoryComponent {

  forums: Forum[] = [];
  trendingForums: Forum[] = [];
  trendingPosts: Post[] = [];
  selectedImage: string | null = null;

  constructor() {}

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

  openImageModal(url: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedImage = url;
    const modal = document.getElementById('image_modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  scrollToSlide(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    try {
      this.forums = await ForumService.getAllForums();
      this.trendingForums = await ForumService.getTrendingForums(4);
      this.trendingPosts = await PostService.getTrendingPosts(10);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }
}
