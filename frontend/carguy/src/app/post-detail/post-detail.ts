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
  isSubmitting = false;
  errorMessage = '';
  voteState: 'like' | 'dislike' | null = null;
  private cdr = inject(ChangeDetectorRef);

  private get voteKey(): string {
    const user = UserService.getCurrentUser();
    return `vote_post_${this.post?.pid}_user_${user?.uid}`;
  }

  private loadVoteState() {
    this.voteState = (localStorage.getItem(this.voteKey) as 'like' | 'dislike' | null) ?? null;
  }

  private saveVoteState() {
    if (this.voteState === null) localStorage.removeItem(this.voteKey);
    else localStorage.setItem(this.voteKey, this.voteState);
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

  async submitComment() {
    if (!this.newCommentContent.trim() || !this.post) return;
    const user = UserService.getCurrentUser();
    if (!user) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      await CommentService.createComment(this.newCommentContent.trim(), user, this.post);
      this.newCommentContent = '';
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
    this.cdr.detectChanges();
  }

  async dislikePost() {
    if (!this.post || !UserService.isLoggedIn()) return;
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
    this.cdr.detectChanges();
  }
}
