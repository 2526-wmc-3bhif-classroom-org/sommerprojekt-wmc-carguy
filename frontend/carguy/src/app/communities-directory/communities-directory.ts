import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { UserService } from '../services/user-service';
import { Forum, ForumCategory } from '../../model';
import { getBrandColor } from '../brand-colors';

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './communities-directory.html'
})
export class CommunitiesRepository implements OnInit {
  featured: Forum[] = [];
  all: Forum[] = [];
  joined: Forum[] = [];
  categories: ForumCategory[] = [];
  trending: any[] = [];

  activeTab: 'all' | 'joined' = 'all';
  selectedCategoryId: number | null = null;
  count = 0;

  private router = inject(Router);
  private userService = inject(UserService);
  private forumService = inject(ForumService);

  async ngOnInit() {
    try {
      this.all = await this.forumService.getAllForums();
      this.featured = this.all.slice(0, 4); // Just show a few for featured
      this.categories = await this.forumService.getAllCategories();
      this.trending = await this.forumService.getTrendingForums(5);
      this.count = this.all.length;

      if (this.userService.isLoggedIn()) {
        this.joined = await this.forumService.getJoinedForums();
      } else {
        this.joined = [];
      }
    } catch (error) {
      console.error('Failed to load forums', error);
    }
  }

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get canCreateCommunity(): boolean {
    const user = this.userService.getCurrentUser();
    return user !== null && ((user.totalAura || 0) >= 100 || user.role === 'admin');
  }

  get filteredForums(): Forum[] {
    const list = this.activeTab === 'all' ? this.all : this.joined;
    if (this.selectedCategoryId === null) {
      return list;
    }
    return list.filter(f => f.category?.forumCategoryId === this.selectedCategoryId);
  }

  selectCategory(id: number | null) {
    if (this.selectedCategoryId === id) {
      this.selectedCategoryId = null;
    } else {
      this.selectedCategoryId = id;
    }
  }

  isJoined(forumId: number): boolean {
    return this.joined.some(f => f.forumId === forumId);
  }

  async joinCommunity(forumId: number) {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      await this.forumService.joinForum(forumId, currentUser.uid);
      
      // Update member count (shared reference across all/featured/joined lists)
      const forum = this.all.find(f => f.forumId === forumId);
      if (forum) {
        forum.memberCount = (forum.memberCount || 0) + 1;
        if (!this.joined.some(f => f.forumId === forumId)) {
          this.joined.push(forum);
        }
      }
    } catch (error) {
      console.error('Failed to join community', error);
    }
  }

  async leaveCommunity(forumId: number) {
    const currentUser = this.userService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      await this.forumService.leaveForum(forumId, currentUser.uid);
      
      // Update member count (shared reference across all/featured/joined lists)
      const forum = this.all.find(f => f.forumId === forumId);
      if (forum) {
        forum.memberCount = Math.max(0, (forum.memberCount || 0) - 1);
      }

      // Remove from joined
      this.joined = this.joined.filter(f => f.forumId !== forumId);
    } catch (error) {
      console.error('Failed to leave community', error);
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
    return getBrandColor(name);
  }
}
