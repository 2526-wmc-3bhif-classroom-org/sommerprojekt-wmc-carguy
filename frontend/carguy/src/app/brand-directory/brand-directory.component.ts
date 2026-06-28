import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { ShoutService } from '../services/shout-service';
import { UserService } from '../services/user-service';
import { Forum, ForumCategory, Post, Shout } from '../../model';
import { getBrandColor } from '../brand-colors';
import { openImageModal, scrollToSlide } from '../image-modal';
import { getUserBadges, Badge } from '../utils/badge';

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brand-directory.component.html',
  styleUrls: ['./brand-directory.component.css']
})
export class BrandDirectoryComponent implements OnInit, OnDestroy {

  forums: Forum[] = [];
  categories: ForumCategory[] = [];
  selectedCategoryId: number | null = null;
  trendingForums: Forum[] = [];
  trendingPosts: Post[] = [];
  selectedImage: string | null = null;

  shouts: Shout[] = [];
  newShoutContent = '';
  isPostingShout = false;
  shoutError = '';
  isLoggedIn = false;
  currentUser: any = null;
  private shoutInterval: any;

  private forumService = inject(ForumService);
  private postService = inject(PostService);
  private shoutService = inject(ShoutService);
  private userService = inject(UserService);

  constructor() {}

  getBrandColor(name: string): string {
    return getBrandColor(name);
  }

  revealedImages: Record<string, boolean> = {};

  isImageFlagged(url?: string): boolean {
    return !!url && url.startsWith('flagged:');
  }

  getImageUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('flagged:')) {
      return url.substring(8);
    }
    return url;
  }

  revealImage(url: string, event: Event) {
    event.stopPropagation();
    this.revealedImages[url] = true;
  }

  openImageModal(url: string, event: Event) {
    this.selectedImage = openImageModal(this.getImageUrl(url), event);
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

  selectCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
  }

  get filteredTrendingForums(): Forum[] {
    if (this.selectedCategoryId === null) {
      return this.trendingForums;
    }
    return this.trendingForums.filter(
      forum => forum.category?.forumCategoryId === this.selectedCategoryId
    );
  }

  get filteredTrendingPosts(): Post[] {
    if (this.selectedCategoryId === null) {
      return this.trendingPosts;
    }
    return this.trendingPosts.filter(
      post => post.forum?.category?.forumCategoryId === this.selectedCategoryId
    );
  }

  scrollPosts(carousel: HTMLDivElement, direction: 'left' | 'right') {
    const scrollAmount = 340; // width of card + gap
    if (direction === 'left') {
      carousel.scrollLeft -= scrollAmount;
    } else {
      carousel.scrollLeft += scrollAmount;
    }
  }

  async ngOnInit() {
    try {
      this.isLoggedIn = this.userService.isLoggedIn();
      this.currentUser = this.userService.getCurrentUser();
      await this.loadShouts();
      this.shoutInterval = setInterval(() => this.loadShouts(), 5000);

      this.forums = await this.forumService.getAllForums();
      this.categories = await this.forumService.getAllCategories();
      this.trendingForums = await this.forumService.getTrendingForums(12);
      const posts = await this.postService.getTrendingPosts(30);

      // Map forum category details from the loaded forums list to the posts
      this.trendingPosts = posts.map(post => {
        const matchingForum = this.forums.find(f => f.forumId === post.forum?.forumId);
        if (matchingForum) {
          return {
            ...post,
            forum: {
              ...post.forum,
              category: matchingForum.category
            }
          };
        }
        return post;
      });
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }

  async loadShouts() {
    try {
      this.shouts = await this.shoutService.getRecentShouts();
    } catch (e) {
      console.error('Failed to load shouts', e);
    }
  }

  async sendShout() {
    if (!this.newShoutContent.trim() || this.isPostingShout) return;
    this.isPostingShout = true;
    this.shoutError = '';
    try {
      await this.shoutService.postShout(this.newShoutContent.trim());
      this.newShoutContent = '';
      await this.loadShouts();
    } catch (e: any) {
      this.shoutError = e.error || e.message || 'Failed to post shout';
    } finally {
      this.isPostingShout = false;
    }
  }

  async deleteShout(sid: number) {
    if (!confirm('Are you sure you want to delete this shout?')) return;
    try {
      await this.shoutService.deleteShout(sid);
      await this.loadShouts();
    } catch (e) {
      console.error('Failed to delete shout', e);
    }
  }

  getUserBadges(user?: any | null): Badge[] {
    return getUserBadges(user);
  }

  ngOnDestroy() {
    if (this.shoutInterval) {
      clearInterval(this.shoutInterval);
    }
  }
}
