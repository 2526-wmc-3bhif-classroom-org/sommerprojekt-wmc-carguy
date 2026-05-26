import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { UserService } from '../services/user-service';
import { Forum, Post } from '../../model';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, FormsModule],
  templateUrl: './community-detail.html',
  styleUrls: ['./community-detail.css']
})
export class CommunityDetailComponent implements OnInit {
  community: Forum | null = null;
  isLoading = true;
  showCreatePost = false;
  newPostTitle = '';
  newPostContent = '';
  isSubmittingPost = false;
  postError = '';
  
  isEditing = false;
  editName = '';
  editDescription = '';
  isUpdating = false;
  updateError = '';

  private cdr = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute) {}

  get isLoggedIn(): boolean {
    return UserService.isLoggedIn();
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      try {
        const id = Number(idParam);
        this.community = await ForumService.getForumById(id);
      } catch (error) {
        console.error('Failed to load community details', error);
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'C';
    return name.substring(0, 2).toUpperCase();
  }

  startEditing() {
    if (!this.community) return;
    this.isEditing = true;
    this.editName = this.community.name;
    this.editDescription = this.community.description || '';
    this.updateError = '';
  }

  cancelEditing() {
    this.isEditing = false;
  }

  async saveCommunity() {
    if (!this.community || !this.editName.trim()) {
      this.updateError = 'Name is required.';
      return;
    }
    
    this.isUpdating = true;
    this.updateError = '';
    
    try {
      await ForumService.updateForum(this.community.forumId, this.editName.trim(), this.editDescription.trim());
      this.community.name = this.editName.trim();
      this.community.description = this.editDescription.trim();
      this.isEditing = false;
    } catch (e: any) {
      this.updateError = e.message || 'Failed to update community.';
    } finally {
      this.isUpdating = false;
      this.cdr.detectChanges();
    }
  }

  openCreatePost() {
    if (!this.isLoggedIn) return;
    this.showCreatePost = true;
    this.newPostTitle = '';
    this.newPostContent = '';
    this.postError = '';
  }

  closeCreatePost() {
    this.showCreatePost = false;
  }

  async submitPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim() || !this.community) return;
    const user = UserService.getCurrentUser();
    if (!user) return;

    this.isSubmittingPost = true;
    this.postError = '';
    try {
      await PostService.createPost(this.newPostTitle.trim(), this.newPostContent.trim(), user, this.community);
      this.showCreatePost = false;
      const id = this.community.forumId;
      this.community = await ForumService.getForumById(id);
      this.cdr.detectChanges();
    } catch (e) {
      this.postError = e instanceof Error ? e.message : 'Failed to create post.';
    } finally {
      this.isSubmittingPost = false;
    }
  }
}
