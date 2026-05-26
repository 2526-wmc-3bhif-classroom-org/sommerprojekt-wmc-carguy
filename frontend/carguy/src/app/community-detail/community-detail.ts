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
  newPostImageUrls: string[] = [];
  imageUrlInput = '';
  isDragging = false;
  isSubmittingPost = false;
  postError = '';
  selectedImage: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute) {}

  openImageModal(url: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedImage = url;
    const modal = document.getElementById('image_modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

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
            this.cdr.detectChanges();
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async submitPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim() || !this.community) return;
    const user = UserService.getCurrentUser();
    if (!user) return;

    this.isSubmittingPost = true;
    this.postError = '';
    try {
      await PostService.createPost(this.newPostTitle.trim(), this.newPostContent.trim(), user, this.community, this.newPostImageUrls);
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
