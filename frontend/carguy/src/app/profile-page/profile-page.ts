import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { LoginPage } from '../login-page/login-page';
import { User, Post, Comment } from '../../model';
import { DatePipe, NgIf } from '@angular/common';
import { UserService } from '../services/user-service';
import { PostService } from '../services/post-service';
import { CommentService } from '../services/comment-service';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-profile-page',
  imports: [
    LoginPage,
    DatePipe,
    NgIf,
    FormsModule,
    RouterModule
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})

export class ProfilePage implements OnInit {
  public isEditing = false;

  public editPublicName: string = '';
  public editUsername: string = '';
  public editDescription: string = '';

  loadedUser: User | null = null;

  recentComments: Comment[] = [];
  recentPosts: Post[] = [];
  activeTab: 'posts' | 'comments' = 'posts';
  isLoadingPosts: boolean = false;

  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  public isSaving = false;

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
    this.router.navigate(['/login']);
  }

  toggleEdit() {
    const loggedInUser = UserService.getCurrentUser();
    if (loggedInUser) {
      this.editPublicName = loggedInUser.publicname;
      this.editUsername = loggedInUser.username;
      this.editDescription = loggedInUser.description || '';
    }
    this.isEditing = true;
  }

  async saveProfile() {
    console.log("Saving called");

    if (this.currentUser) {
      this.isSaving = true;

      const updatedUser: User = {
        ...this.currentUser,
        publicname: this.editPublicName,
        username: this.editUsername,
        description: this.editDescription,
      }

      try {
        console.log("calling editUser with: ", this.currentUser, updatedUser);
        this.loadedUser = await UserService.editUserInfo(this.currentUser, updatedUser);
        console.log("updated user info: ", this.currentUser);
        this.isEditing = false;
      } catch (err) {
        console.error("failed to update user: ", err);
      } finally {
        this.isSaving = false;
        this.cdr.detectChanges(); // Manually trigger change detection
      }
    } else {
      console.log("Failed because no current user");
    }
  }

  abortEdit() {
    const loggedInUser = UserService.getCurrentUser();
    if (loggedInUser) {
      this.editPublicName = loggedInUser.publicname;
      this.editUsername = loggedInUser.username;
      this.editDescription = loggedInUser.description || '';
    }
    this.isEditing = false;
  }


}
