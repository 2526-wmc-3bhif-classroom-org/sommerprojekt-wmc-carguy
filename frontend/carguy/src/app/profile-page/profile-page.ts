import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import {LoginPage} from '../login-page/login-page';
import {User, Post, Comment} from '../../model';
import { DatePipe, NgIf } from '@angular/common';
import {UserService} from '../services/user-service';
import {PostService} from '../services/post-service';
import {CommentService} from '../services/comment-service';
import { RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  imports: [
    LoginPage,
    DatePipe,
    NgIf,
    RouterModule
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePage implements OnInit {
  loadedUser: User | null = null;
  recentPosts: Post[] = [];
  recentComments: Comment[] = [];
  activeTab: 'posts' | 'comments' = 'posts';
  isLoadingPosts = false;
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);

  get loggedIn(): boolean {
    return UserService.isLoggedIn();
  }

  get currentUser(): User | null {
    return this.loadedUser || UserService.getCurrentUser();
  }

  get isOwnProfile(): boolean {
    const loggedInUser = UserService.getCurrentUser();
    return loggedInUser !== null && this.currentUser !== null && loggedInUser.uid === this.currentUser.uid;
  }

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    let userId: number | null = null;
    
    if (idParam) {
      userId = Number(idParam);
    } else {
      const user = UserService.getCurrentUser();
      if (user) {
        userId = user.uid;
      }
    }

    if (userId) {
      try {
        this.loadedUser = await UserService.getUserById(userId);
        this.isLoadingPosts = true;
        
        const [posts, comments] = await Promise.all([
            PostService.getPostsByUser(userId),
            CommentService.getCommentsByUser(userId)
        ]);

        this.recentPosts = posts;
        this.recentComments = comments;

        this.isLoadingPosts = false;
        this.cdr.detectChanges();
      } catch (error) {
        console.error('Failed to load user profile stats or posts/comments:', error);
        this.isLoadingPosts = false;
        this.cdr.detectChanges();
      }
    }
  }

  public logout(): void {
    UserService.logout();
  }
}
