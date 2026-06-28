import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Post, Comment } from '../../model';
import { PostService } from '../services/post-service';
import { CommentService } from '../services/comment-service';
import { UserService } from '../services/user-service';
import { openImageModal, scrollToSlide } from '../image-modal';
import { getUserBadges, Badge } from '../utils/badge';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './post-detail.html',
})
export class PostDetailComponent implements OnInit {
  getUserBadges(user?: any | null): Badge[] {
    return getUserBadges(user);
  }
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
  isVotingPost = false;
  isVotingComment: Record<number, boolean> = {};
  selectedImage: string | null = null;
  isBookmarkedState = false;
  collapsedComments: Record<number, boolean> = {};
  isVotingPoll = false;

  private sanitizer = inject(DomSanitizer);

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

  async votePoll(optionIndex: number) {
    if (!this.post || !this.userService.isLoggedIn() || this.isVotingPoll) return;
    if (this.post.poll?.userVotedOptionIndex !== undefined) return;
    this.isVotingPoll = true;
    try {
      await this.postService.voteInPoll(this.post.pid, optionIndex);
      const updated = await this.postService.getPostById(this.post.pid);
      if (updated) {
        this.post.poll = updated.poll;
      }
    } catch (e) {
      console.error('Failed to vote in poll', e);
    } finally {
      this.isVotingPoll = false;
    }
  }

  getPollOptionPercentage(option: any): number {
    if (!this.post || !this.post.poll || !this.post.poll.options) return 0;
    const total = this.post.poll.options.reduce((acc: number, opt: any) => acc + (opt.votes || 0), 0);
    if (total === 0) return 0;
    return Math.round(((option.votes || 0) / total) * 100);
  }

  toggleCollapseComment(cid: number) {
    this.collapsedComments[cid] = !this.collapsedComments[cid];
  }

  parseMarkdown(text: string): string {
    if (!text) return '';
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/`(.*?)`/g, '<code class="bg-base-300 px-1 rounded font-mono text-[10px] text-accent">$1</code>');
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a class="text-accent hover:underline" href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
  }

  getSafeMarkdown(text: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.parseMarkdown(text));
  }

  async toggleBookmark() {
    if (!this.post || !this.userService.isLoggedIn()) return;
    try {
      if (this.isBookmarkedState) {
        this.isBookmarkedState = false;
        await this.postService.unbookmarkPost(this.post.pid);
      } else {
        this.isBookmarkedState = true;
        await this.postService.bookmarkPost(this.post.pid);
      }
    } catch (e) {
      console.error('Failed to toggle bookmark', e);
    }
  }

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
        if (this.userService.isLoggedIn()) {
          this.isBookmarkedState = await this.postService.isBookmarked(id);
        }
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

  triggerAuraShift(event: MouseEvent, auraChange: string) {
    const el = document.createElement('div');
    el.innerText = auraChange;
    el.className = 'absolute font-black pointer-events-none select-none text-xs z-[9999] animate-aura-shift';
    if (auraChange.startsWith('+')) {
      el.style.color = '#4ade80'; // text-green-400
    } else {
      el.style.color = '#f87171'; // text-red-400
    }
    el.style.left = `${event.clientX}px`;
    el.style.top = `${event.clientY - 20}px`;
    el.style.position = 'fixed';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 800);
  }

  async likePost(event?: MouseEvent) {
    if (!this.post || !this.userService.isLoggedIn() || this.isVotingPost) return;
    this.isVotingPost = true;
    try {
      if (event) {
        this.triggerAuraShift(event, this.voteState === 'like' ? '-1 Aura' : '+1 Aura');
      }
      if (this.voteState === 'like') {
        this.post.likes--;
        this.voteState = null;
        await this.postService.unlikePost(this.post.pid);
      } else {
        if (this.voteState === 'dislike') {
          this.post.dislikes--;
          await this.postService.undislikePost(this.post.pid);
        }
        this.post.likes++;
        this.voteState = 'like';
        await this.postService.likePost(this.post.pid);
      }
      this.saveVoteState();
    } catch (e) {
      console.error('Failed to like post', e);
    } finally {
      this.isVotingPost = false;
    }
  }

  async dislikePost(event?: MouseEvent) {
    if (!this.post || !this.userService.isLoggedIn() || this.isVotingPost) return;
    this.isVotingPost = true;
    try {
      if (event) {
        this.triggerAuraShift(event, this.voteState === 'dislike' ? '+1 Aura' : '-1 Aura');
      }
      if (this.voteState === 'dislike') {
        this.post.dislikes--;
        this.voteState = null;
        await this.postService.undislikePost(this.post.pid);
      } else {
        if (this.voteState === 'like') {
          this.post.likes--;
          await this.postService.unlikePost(this.post.pid);
        }
        this.post.dislikes++;
        this.voteState = 'dislike';
        await this.postService.dislikePost(this.post.pid);
      }
      this.saveVoteState();
    } catch (e) {
      console.error('Failed to dislike post', e);
    } finally {
      this.isVotingPost = false;
    }
  }

  async likeComment(comment: Comment, event?: MouseEvent) {
    if (!this.userService.isLoggedIn() || this.isVotingComment[comment.cid]) return;
    this.isVotingComment[comment.cid] = true;
    const currentState = this.commentVoteStates[comment.cid];
    try {
      if (event) {
        this.triggerAuraShift(event, currentState === 'like' ? '-1 Aura' : '+1 Aura');
      }
      if (currentState === 'like') {
        comment.likes--;
        this.commentVoteStates[comment.cid] = null;
        await this.commentService.unlikeComment(comment.cid);
      } else {
        if (currentState === 'dislike') {
          comment.dislikes--;
          await this.commentService.undislikeComment(comment.cid);
        }
        comment.likes++;
        this.commentVoteStates[comment.cid] = 'like';
        await this.commentService.likeComment(comment.cid);
      }
      this.saveCommentVoteState(comment.cid);
    } catch (e) {
      console.error('Failed to like comment', e);
    } finally {
      this.isVotingComment[comment.cid] = false;
    }
  }

  async dislikeComment(comment: Comment, event?: MouseEvent) {
    if (!this.userService.isLoggedIn() || this.isVotingComment[comment.cid]) return;
    this.isVotingComment[comment.cid] = true;
    const currentState = this.commentVoteStates[comment.cid];
    try {
      if (event) {
        this.triggerAuraShift(event, currentState === 'dislike' ? '+1 Aura' : '-1 Aura');
      }
      if (currentState === 'dislike') {
        comment.dislikes--;
        this.commentVoteStates[comment.cid] = null;
        await this.commentService.undislikeComment(comment.cid);
      } else {
        if (currentState === 'like') {
          comment.likes--;
          await this.commentService.unlikeComment(comment.cid);
        }
        comment.dislikes++;
        this.commentVoteStates[comment.cid] = 'dislike';
        await this.commentService.dislikeComment(comment.cid);
      }
      this.saveCommentVoteState(comment.cid);
    } catch (e) {
      console.error('Failed to dislike comment', e);
    } finally {
      this.isVotingComment[comment.cid] = false;
    }
  }
}
