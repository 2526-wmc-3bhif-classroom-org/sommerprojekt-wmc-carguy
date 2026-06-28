import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { UserService } from '../services/user-service';
import { Forum, Post } from '../../model';
import { openImageModal, scrollToSlide } from '../image-modal';

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

  // Editing community
  isEditing = false;
  editName = '';
  editDescription = '';
  isUpdating = false;
  updateError = '';

  // Creating post with images
  newPostImageUrls: string[] = [];
  imageUrlInput = '';
  isDragging = false;

  // Poll creation
  showPollForm = false;
  pollQuestion = '';
  pollOptions: string[] = ['', ''];

  togglePollForm() {
    this.showPollForm = !this.showPollForm;
  }

  addPollOption() {
    if (this.pollOptions.length < 5) {
      this.pollOptions.push('');
    }
  }

  removePollOption(index: number) {
    if (this.pollOptions.length > 2) {
      this.pollOptions.splice(index, 1);
    }
  }

  // View post images / sorting
  selectedImage: string | null = null;
  sortMode: 'newest' | 'oldest' | 'most_liked' = 'newest';

  isMember = false;
  isMembershipLoading = false;

  private userService = inject(UserService);
  private forumService = inject(ForumService);
  private postService = inject(PostService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get canEditCommunity(): boolean {
    const user = this.userService.getCurrentUser();
    return this.isLoggedIn && !!user && !!this.community && this.community.authorId === user.uid;
  }

  async checkMembership() {
    if (!this.isLoggedIn || !this.community) return;
    const user = this.userService.getCurrentUser();
    if (!user) return;
    try {
      this.isMember = await this.forumService.isUserInForum(this.community.forumId, user.uid);
    } catch (e) {
      this.isMember = false;
    }
  }

  async joinCommunity() {
    if (!this.isLoggedIn || !this.community) {
      this.router.navigate(['/login']);
      return;
    }
    const user = this.userService.getCurrentUser();
    if (!user) return;
    
    this.isMembershipLoading = true;
    try {
      await this.forumService.joinForum(this.community.forumId, user.uid);
      this.isMember = true;
      if(this.community.memberCount !== undefined) this.community.memberCount++;
    } catch (e) {
      console.error('Failed to join', e);
    } finally {
      this.isMembershipLoading = false;
    }
  }

  async leaveCommunity() {
    if (!this.isLoggedIn || !this.community) return;
    const user = this.userService.getCurrentUser();
    if (!user) return;
    
    this.isMembershipLoading = true;
    try {
      await this.forumService.leaveForum(this.community.forumId, user.uid);
      this.isMember = false;
      if(this.community.memberCount !== undefined && this.community.memberCount > 0) this.community.memberCount--;
    } catch (e) {
      console.error('Failed to leave', e);
    } finally {
      this.isMembershipLoading = false;
    }
  }

  async deleteCommunity() {
    if (!this.community) return;
    if (confirm(`Are you sure you want to delete the community "${this.community.name}"?`)) {
      try {
        await this.forumService.deleteForum(this.community.forumId);
        this.router.navigate(['/communities']);
      } catch (error) {
        console.error('Failed to delete community', error);
        alert('Failed to delete community.');
      }
    }
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const idParam = params.get('id');
      this.isLoading = true;
      if (idParam) {
        try {
          const id = Number(idParam);
          this.community = await this.forumService.getForumById(id);
          await this.checkMembership();
        } catch (error) {
          console.error('Failed to load community details', error);
        } finally {
          this.isLoading = false;
        }
      } else {
        this.isLoading = false;
      }
    });
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
      await this.forumService.updateForum(this.community.forumId, this.editName.trim(), this.editDescription.trim());
      this.community.name = this.editName.trim();
      this.community.description = this.editDescription.trim();
      this.isEditing = false;
    } catch (e: any) {
      this.updateError = e.message || 'Failed to update community.';
    } finally {
      this.isUpdating = false;
    }
  }

  get sortedPosts(): Post[] {
    if (!this.community?.posts) return [];
    
    // Create a copy to avoid mutating the original array
    const posts = [...this.community.posts];
    
    return posts.sort((a, b) => {
      switch (this.sortMode) {
        case 'oldest':
          return new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime();
        case 'most_liked':
          return b.likes - a.likes;
        case 'newest':
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });
  }

  openImageModal(url: string, event: Event) {
    this.selectedImage = openImageModal(url, event);
  }

  scrollToSlide(id: string) {
    scrollToSlide(id);
  }

  openCreatePost() {
    if (!this.isLoggedIn) return;
    this.showCreatePost = true;
    this.newPostTitle = '';
    this.newPostContent = '';
    this.newPostImageUrls = [];
    this.imageUrlInput = '';
    this.postError = '';
  }

  closeCreatePost() {
    this.showCreatePost = false;
  }

  addImageUrl() {
    if (this.imageUrlInput.trim()) {
      this.newPostImageUrls.push(this.imageUrlInput.trim());
      this.imageUrlInput = '';
    }
  }

  removeImageUrl(index: number) {
    this.newPostImageUrls.splice(index, 1);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onFileSelected(event: any) {
    if (event.target.files) {
      this.handleFiles(Array.from(event.target.files));
    }
  }

  private handleFiles(files: File[]) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            this.newPostImageUrls.push(e.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async submitPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim() || !this.community) return;
    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.isSubmittingPost = true;
    this.postError = '';
    try {
      const poll = this.showPollForm && this.pollQuestion.trim()
        ? {
            question: this.pollQuestion.trim(),
            options: this.pollOptions.filter(o => o.trim() !== '')
          }
        : undefined;

      await this.postService.createPost(
        this.newPostTitle.trim(),
        this.newPostContent.trim(),
        user,
        this.community,
        this.newPostImageUrls,
        poll
      );

      this.newPostTitle = '';
      this.newPostContent = '';
      this.newPostImageUrls = [];
      this.imageUrlInput = '';
      this.showPollForm = false;
      this.pollQuestion = '';
      this.pollOptions = ['', ''];

      this.showCreatePost = false;
      const id = this.community.forumId;
      this.community = await this.forumService.getForumById(id);
    } catch (e) {
      this.postError = e instanceof Error ? e.message : 'Failed to create post.';
    } finally {
      this.isSubmittingPost = false;
    }
  }
}