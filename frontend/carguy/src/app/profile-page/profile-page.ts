import { Component, OnInit, inject } from '@angular/core';
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
  public editImage: string = '';
  public editTitle: string = '';

  loadedUser: User | null = null;

  recentComments: Comment[] = [];
  recentPosts: Post[] = [];
  activeTab: 'posts' | 'comments' = 'posts';
  isLoadingPosts: boolean = false;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private commentService = inject(CommentService);

  public isSaving = false;

  get loggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get currentUser(): User | null {
    return this.loadedUser || this.userService.getCurrentUser();
  }

  get isOwnProfile(): boolean {
      const loggedInUser = this.userService.getCurrentUser();
      return loggedInUser !== null && this.currentUser !== null && loggedInUser.uid === this.currentUser.uid;
  }

  get canEditTitle(): boolean {
    const user = this.userService.getCurrentUser();
    return user !== null && ((user.totalAura || 0) >= 100 || user.role === 'admin');
  }

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const idParam = params.get('id');
      let userId: number | null = null;

      if (idParam) {
        userId = Number(idParam);
      } else {
        const user = this.userService.getCurrentUser();
        if (user) {
          userId = user.uid;
        }
      }

      if (userId) {
        try {
          this.loadedUser = await this.userService.getUserById(userId);
          this.isLoadingPosts = true;

          const [posts, comments] = await Promise.all([
            this.postService.getPostsByUser(userId),
            this.commentService.getCommentsByUser(userId)
          ]);

          this.recentPosts = posts;
          this.recentComments = comments;

          this.isLoadingPosts = false;
        } catch (error) {
          console.error('Failed to load user profile stats or posts/comments:', error);
          this.isLoadingPosts = false;
        }
      }
    });
  }

  public logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }

  toggleEdit() {
    const loggedInUser = this.userService.getCurrentUser();
    if (loggedInUser) {
      this.editPublicName = loggedInUser.publicname;
      this.editUsername = loggedInUser.username;
      this.editDescription = loggedInUser.description || '';
      this.editImage = loggedInUser.image || '';
      this.editTitle = loggedInUser.title || '';
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
        image: this.editImage,
        title: this.editTitle,
      }

      try {
        console.log("calling editUser with: ", this.currentUser, updatedUser);
        this.loadedUser = await this.userService.editUserInfo(this.currentUser, updatedUser);
        console.log("updated user info: ", this.currentUser);
        this.isEditing = false;
      } catch (err) {
        console.error("failed to update user: ", err);
      } finally {
        this.isSaving = false;
      }
    } else {
      console.log("Failed because no current user");
    }
  }

  abortEdit() {
    const loggedInUser = this.userService.getCurrentUser();
    if (loggedInUser) {
      this.editPublicName = loggedInUser.publicname;
      this.editUsername = loggedInUser.username;
      this.editDescription = loggedInUser.description || '';
      this.editImage = loggedInUser.image || '';
      this.editTitle = loggedInUser.title || '';
    }
    this.isEditing = false;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.editImage = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
