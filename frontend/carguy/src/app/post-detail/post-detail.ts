import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, Comment } from '../../model';
import { PostService } from '../services/post-service';
import { CommentService } from '../services/comment-service';
import { UserService } from '../services/user-service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './post-detail.html',
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  isLoading = true;
  newCommentContent = '';
  newCommentImageUrls: string[] = [];
  imageUrlInput = '';
  isDragging = false;
  isSubmitting = false;
  errorMessage = '';
  voteState: 'like' | 'dislike' | null = null;
  commentVoteStates: Record<number, 'like' | 'dislike' | null> = {};
  selectedImage: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  openImageModal(url: string, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.selectedImage = url;
    const modal = document.getElementById('image_modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  private get voteKey(): string {
    const user = UserService.getCurrentUser();
    return `vote_post_${this.post?.pid}_user_${user?.uid}`;
  }

  private loadVoteState() {
    this.voteState = (localStorage.getItem(this.voteKey) as 'like' | 'dislike' | null) ?? null;
    for (const comment of this.comments) {
      this.commentVoteStates[comment.cid] = (localStorage.getItem(this.getCommentVoteKey(comment.cid)) as 'like' | 'dislike' | null) ?? null;
    }
  }

  private saveVoteState() {
    if (this.voteState === null) localStorage.removeItem(this.voteKey);
    else localStorage.setItem(this.voteKey, this.voteState);
  }

  private getCommentVoteKey(cid: number): string {
    const user = UserService.getCurrentUser();
    return `vote_comment_${cid}_user_${user?.uid}`;
  }

  private saveCommentVoteState(cid: number) {
    const state = this.commentVoteStates[cid];
    if (state === null) localStorage.removeItem(this.getCommentVoteKey(cid));
    else localStorage.setItem(this.getCommentVoteKey(cid), state);
  }

  constructor(private route: ActivatedRoute) {}

  get isLoggedIn(): boolean {
    return UserService.isLoggedIn();
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.isLoading = false;
      return;
    }
    try {
      const id = Number(idParam);
      this.post = await PostService.getPostById(id);
      this.comments = await CommentService.getCommentsByPostId(id);
      this.loadVoteState();
    } catch (error) {
      console.error('Failed to load post', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  addImageUrl() {
    if (this.imageUrlInput.trim()) {
      this.newCommentImageUrls.push(this.imageUrlInput.trim());
      this.imageUrlInput = '';
    }
  }

  removeImageUrl(index: number) {
    this.newCommentImageUrls.splice(index, 1);
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
            this.newCommentImageUrls.push(e.target.result as string);
            this.cdr.detectChanges();
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async submitComment() {
    if (!this.newCommentContent.trim() || !this.post) return;
    const user = UserService.getCurrentUser();
    if (!user) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      await CommentService.createComment(this.newCommentContent.trim(), user, this.post, this.newCommentImageUrls);
      this.newCommentContent = '';
      this.newCommentImageUrls = [];
      this.imageUrlInput = '';
      this.comments = await CommentService.getCommentsByPostId(this.post.pid);
      this.cdr.detectChanges();
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Failed to post comment.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async likePost() {
    if (!this.post || !UserService.isLoggedIn()) return;
    try {
      if (this.voteState === 'like') {
        await PostService.unlikePost(this.post.pid);
        this.post.likes--;
        this.voteState = null;
      } else {
        if (this.voteState === 'dislike') {
          await PostService.undislikePost(this.post.pid);
          this.post.dislikes--;
        }
        await PostService.likePost(this.post.pid);
        this.post.likes++;
        this.voteState = 'like';
      }
      this.saveVoteState();
    } catch (e) {
      console.error('Failed to like post', e);
    }
    this.cdr.detectChanges();
  }

  async dislikePost() {
    if (!this.post || !UserService.isLoggedIn()) return;
    try {
      if (this.voteState === 'dislike') {
        await PostService.undislikePost(this.post.pid);
        this.post.dislikes--;
        this.voteState = null;
      } else {
        if (this.voteState === 'like') {
          await PostService.unlikePost(this.post.pid);
          this.post.likes--;
        }
        await PostService.dislikePost(this.post.pid);
        this.post.dislikes++;
        this.voteState = 'dislike';
      }
      this.saveVoteState();
    } catch (e) {
      console.error('Failed to dislike post', e);
    }
    this.cdr.detectChanges();
  }

  async likeComment(comment: Comment) {
    if (!UserService.isLoggedIn()) return;
    const currentState = this.commentVoteStates[comment.cid];
    try {
      if (currentState === 'like') {
        await CommentService.unlikeComment(comment.cid);
        comment.likes--;
        this.commentVoteStates[comment.cid] = null;
      } else {
        if (currentState === 'dislike') {
          await CommentService.undislikeComment(comment.cid);
          comment.dislikes--;
        }
        await CommentService.likeComment(comment.cid);
        comment.likes++;
        this.commentVoteStates[comment.cid] = 'like';
      }
      this.saveCommentVoteState(comment.cid);
    } catch (e) {
      console.error('Failed to like comment', e);
    }
    this.cdr.detectChanges();
  }

  async dislikeComment(comment: Comment) {
    if (!UserService.isLoggedIn()) return;
    const currentState = this.commentVoteStates[comment.cid];
    try {
      if (currentState === 'dislike') {
        await CommentService.undislikeComment(comment.cid);
        comment.dislikes--;
        this.commentVoteStates[comment.cid] = null;
      } else {
        if (currentState === 'like') {
          await CommentService.unlikeComment(comment.cid);
          comment.likes--;
        }
        await CommentService.dislikeComment(comment.cid);
        comment.dislikes++;
        this.commentVoteStates[comment.cid] = 'dislike';
      }
      this.saveCommentVoteState(comment.cid);
    } catch (e) {
      console.error('Failed to dislike comment', e);
    }
    this.cdr.detectChanges();
  }
}
