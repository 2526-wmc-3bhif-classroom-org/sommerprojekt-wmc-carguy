import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { Forum, Post } from '../../model';
import { getBrandColor } from '../brand-colors';
import { openImageModal, scrollToSlide } from '../image-modal';

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-directory.component.html',
  styleUrls: ['./brand-directory.component.css']
})
export class BrandDirectoryComponent implements OnInit {

  forums: Forum[] = [];
  trendingForums: Forum[] = [];
  trendingPosts: Post[] = [];
  selectedImage: string | null = null;

  private forumService = inject(ForumService);
  private postService = inject(PostService);

  constructor() {}

  getBrandColor(name: string): string {
    return getBrandColor(name);
  }

  openImageModal(url: string, event: Event) {
    this.selectedImage = openImageModal(url, event);
  }

  scrollToSlide(id: string) {
    scrollToSlide(id);
  }

  get activeBrandsCount(): number {
    return this.forums.length;
  }

  get totalMembersCount(): string {
    const total = this.forums.reduce((acc, f) => acc + (f.memberCount || 0), 0);
    return this.formatNumber(total);
  }

  get totalPostsCount(): string {
    const total = this.forums.reduce((acc, f) => acc + (f.postCount || 0), 0);
    return this.formatNumber(total);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  }

  async ngOnInit() {
    try {
      this.forums = await this.forumService.getAllForums();
      this.trendingForums = await this.forumService.getTrendingForums(4);
      this.trendingPosts = await this.postService.getTrendingPosts(10);
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }
}
