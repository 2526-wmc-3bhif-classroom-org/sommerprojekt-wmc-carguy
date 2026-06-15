import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, Comment } from '../../model';
import { PostService } from '../services/post-service';
import { CommentService } from '../services/comment-service';
import { UserService } from '../services/user-service';
import { openImageModal, scrollToSlide } from '../image-modal';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './post-detail.html',
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  comments: Comment[] = [];
  rootComments: Comment[] = [];
  activeReplyCommentId: number | null = null;
  replyContent = '';
  isLoading = true;
  newCommentContent = '';
  newCommentImageUrls: string[] = [];
  imageUrlInput = '';
  isDragging = false;
  isSubmitting = false;
  errorMessage = '';
  voteState: 'like' | 'dislike' | null = null;
  commentVoteStates: Record<number, 'like' | 'dislike' | null> = {};
  sortMode: 'newest' | 'oldest' | 'most_liked' = 'newest';
  selectedImage: string | null = null;

  private userService = inject(UserService);
  private postService = inject(PostService);
  private commentService = inject(CommentService);

  openImageModal(url: string, event: Event) {
    this.selectedImage = openImageModal(url, event);
  }

  scrollToSlide(id: string) {
    scrollToSlide(id);
  }

  private get voteKey(): string {
    const user = this.userService.getCurrentUser();
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
    const user = this.userService.getCurrentUser();
    return `vote_comment_${cid}_user_${user?.uid}`;
  }

  private saveCommentVoteState(cid: number) {
    const state = this.commentVoteStates[cid];
    if (state === null) localStorage.removeItem(this.getCommentVoteKey(cid));
    else localStorage.setItem(this.getCommentVoteKey(cid), state);
  }

  constructor(private route: ActivatedRoute) {}

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get sortedComments(): Comment[] {
    if (!this.comments) return [];
    
    // Create a copy to avoid mutating the original array
    const commentsCopy = [...this.comments];
    
    return commentsCopy.sort((a, b) => {
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

  get sortedRootComments(): Comment[] {
    if (!this.rootComments) return [];
    
    // Sort rootComments copy
    const rootCopy = [...this.rootComments];
    
    const sortFn = (list: Comment[]) => {
      list.sort((a, b) => {
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
      for (const item of list) {
        if (item.replies && item.replies.length > 0) {
          sortFn(item.replies);
        }
      }
    };
    
    sortFn(rootCopy);
    return rootCopy;
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const idParam = params.get('id');
      this.isLoading = true;
      if (!idParam) {
        this.isLoading = false;
        return;
      }
      try {
        const id = Number(idParam);
        this.post = await this.postService.getPostById(id);
        this.comments = await this.commentService.getCommentsByPostId(id);
        this.rootComments = this.buildCommentTree(this.comments);
        this.loadVoteState();
      } catch (error) {
        console.error('Failed to load post', error);
      } finally {
        this.isLoading = false;
      }
    });
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
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  async submitComment() {
    if (!this.newCommentContent.trim() || !this.post) return;
    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      await this.commentService.createComment(this.newCommentContent.trim(), user, this.post, this.newCommentImageUrls);
      this.newCommentContent = '';
      this.newCommentImageUrls = [];
      this.imageUrlInput = '';
      this.comments = await this.commentService.getCommentsByPostId(this.post.pid);
      this.rootComments = this.buildCommentTree(this.comments);
      this.loadVoteState();
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Failed to post comment.';
    } finally {
      this.isSubmitting = false;
    }
  }

  buildCommentTree(flatComments: Comment[]): Comment[] {
    const commentMap = new Map<number, Comment>();
    const roots: Comment[] = [];

    for (const comment of flatComments) {
      comment.replies = [];
      commentMap.set(comment.cid, comment);
    }

    for (const comment of flatComments) {
      if (comment.parentComment && comment.parentComment.cid) {
        const parent = commentMap.get(comment.parentComment.cid);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
        } else {
          roots.push(comment);
        }
      } else {
        roots.push(comment);
      }
    }

    // Sort by publication date
    const sortComments = (list: Comment[]) => {
      list.sort((a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime());
      for (const item of list) {
        if (item.replies && item.replies.length > 0) {
          sortComments(item.replies);
        }
      }
    };

    sortComments(roots);
    return roots;
  }

  toggleReplyForm(cid: number) {
    if (!this.userService.isLoggedIn()) return;
    if (this.activeReplyCommentId === cid) {
      this.activeReplyCommentId = null;
      this.replyContent = '';
    } else {
      this.activeReplyCommentId = cid;
      this.replyContent = '';
    }
  }

  cancelReply() {
    this.activeReplyCommentId = null;
    this.replyContent = '';
  }

  async submitReply(parentComment: Comment) {
    if (!this.replyContent.trim() || !this.post) return;
    const user = this.userService.getCurrentUser();
    if (!user) return;

    this.isSubmitting = true;
    this.errorMessage = '';
    try {
      await this.commentService.createReply(this.replyContent.trim(), user, this.post, parentComment);
      this.replyContent = '';
      this.activeReplyCommentId = null;
      this.comments = await this.commentService.getCommentsByPostId(this.post.pid);
      this.rootComments = this.buildCommentTree(this.comments);
      this.loadVoteState();
    } catch (e) {
      this.errorMessage = e instanceof Error ? e.message : 'Failed to post reply.';
    } finally {
      this.isSubmitting = false;
    }
  }

  async likePost() {
    if (!this.post || !this.userService.isLoggedIn()) return;
    try {
      if (this.voteState === 'like') {
        await this.postService.unlikePost(this.post.pid);
        this.post.likes--;
        this.voteState = null;
      } else {
        if (this.voteState === 'dislike') {
          await this.postService.undislikePost(this.post.pid);
          this.post.dislikes--;
        }
        await this.postService.likePost(this.post.pid);
        this.post.likes++;
        this.voteState = 'like';
      }
      this.saveVoteState();
    } catch (e) {
      console.error('Failed to like post', e);
    }
  }

  async dislikePost() {
    if (!this.post || !this.userService.isLoggedIn()) return;
    try {
      if (this.voteState === 'dislike') {
        await this.postService.undislikePost(this.post.pid);
        this.post.dislikes--;
        this.voteState = null;
      } else {
        if (this.voteState === 'like') {
          await this.postService.unlikePost(this.post.pid);
          this.post.likes--;
        }
        await this.postService.dislikePost(this.post.pid);
        this.post.dislikes++;
        this.voteState = 'dislike';
      }
      this.saveVoteState();
    } catch (e) {
      console.error('Failed to dislike post', e);
    }
  }

  async likeComment(comment: Comment) {
    if (!this.userService.isLoggedIn()) return;
    const currentState = this.commentVoteStates[comment.cid];
    try {
      if (currentState === 'like') {
        await this.commentService.unlikeComment(comment.cid);
        comment.likes--;
        this.commentVoteStates[comment.cid] = null;
      } else {
        if (currentState === 'dislike') {
          await this.commentService.undislikeComment(comment.cid);
          comment.dislikes--;
        }
        await this.commentService.likeComment(comment.cid);
        comment.likes++;
        this.commentVoteStates[comment.cid] = 'like';
      }
      this.saveCommentVoteState(comment.cid);
    } catch (e) {
      console.error('Failed to like comment', e);
    }
  }

  async dislikeComment(comment: Comment) {
    if (!this.userService.isLoggedIn()) return;
    const currentState = this.commentVoteStates[comment.cid];
    try {
      if (currentState === 'dislike') {
        await this.commentService.undislikeComment(comment.cid);
        comment.dislikes--;
        this.commentVoteStates[comment.cid] = null;
      } else {
        if (currentState === 'like') {
          await this.commentService.unlikeComment(comment.cid);
          comment.likes--;
        }
        await this.commentService.dislikeComment(comment.cid);
        comment.dislikes++;
        this.commentVoteStates[comment.cid] = 'dislike';
      }
      this.saveCommentVoteState(comment.cid);
    } catch (e) {
      console.error('Failed to dislike comment', e);
    }
  }
}
