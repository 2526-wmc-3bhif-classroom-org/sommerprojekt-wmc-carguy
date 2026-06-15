import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { Forum, ForumCategory, Post } from '../../model';
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
  categories: ForumCategory[] = [];
  selectedCategoryId: number | null = null;
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
}
