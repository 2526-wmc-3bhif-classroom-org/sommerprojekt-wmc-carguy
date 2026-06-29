import { Component, OnInit, inject } from '@angular/core';
import { LoginPage } from '../login-page/login-page';
import { User, Post, Comment, GarageVehicle } from '../../model';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService } from '../services/user-service';
import { PostService } from '../services/post-service';
import { CommentService } from '../services/comment-service';
import { GarageService } from '../services/garage-service';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { getUserBadges, Badge } from '../utils/badge';
import { openImageModal, scrollToSlide } from '../image-modal';

@Component({
  selector: 'app-profile-page',
  imports: [
    LoginPage,
    DatePipe,
    FormsModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})

export class ProfilePage implements OnInit {
  getUserBadges(user?: any | null): Badge[] {
    return getUserBadges(user);
  }
  public isEditing = false;
  selectedImage: string | null = null;

  openImageModal(url: string, event: Event) {
    this.selectedImage = openImageModal(this.getImageUrl(url), event);
  }

  scrollToSlide(id: string) {
    scrollToSlide(id);
  }


  public editPublicName: string = '';
  public editUsername: string = '';
  public editDescription: string = '';
  public editImage: string = '';
  public editTitle: string = '';

  loadedUser: User | null = null;

  recentComments: Comment[] = [];
  recentPosts: Post[] = [];
  bookmarkedPosts: Post[] = [];
  vehicles: GarageVehicle[] = [];
  activeTab: 'posts' | 'comments' | 'bookmarks' | 'garage' = 'posts';
  isLoadingPosts: boolean = false;

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

  showAddVehicleModal = false;
  newVehicleMake = '';
  newVehicleModel = '';
  newVehicleYear = new Date().getFullYear();
  newVehicleMods = '';
  newVehicleImageUrl = '';
  isSubmittingVehicle = false;
  vehicleError = '';

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private commentService = inject(CommentService);
  private garageService = inject(GarageService);

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

          const isOwn = this.isOwnProfile;

          const [posts, comments, bookmarks, garage] = await Promise.all([
            this.postService.getPostsByUser(userId),
            this.commentService.getCommentsByUser(userId),
            isOwn ? this.postService.getBookmarkedPosts() : Promise.resolve([]),
            this.garageService.getUserGarage(userId)
          ]);

          this.recentPosts = posts;
          this.recentComments = comments;
          this.bookmarkedPosts = bookmarks;
          this.vehicles = garage;

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

  isDraggingVehicle = false;

  onVehicleDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingVehicle = true;
  }

  onVehicleDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingVehicle = false;
  }

  onVehicleDrop(event: DragEvent) {
    event.preventDefault();
    this.isDraggingVehicle = false;
    if (event.dataTransfer?.files) {
      this.handleVehicleFiles(Array.from(event.dataTransfer.files));
    }
  }

  onVehicleFileSelected(event: any) {
    if (event.target.files) {
      this.handleVehicleFiles(Array.from(event.target.files));
    }
  }

  private handleVehicleFiles(files: File[]) {
    const file = files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.newVehicleImageUrl = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  removeVehicleImage() {
    this.newVehicleImageUrl = '';
  }

  async addVehicle() {
    if (!this.newVehicleMake.trim() || !this.newVehicleModel.trim() || !this.newVehicleYear || this.isSubmittingVehicle) return;
    this.isSubmittingVehicle = true;
    this.vehicleError = '';
    try {
      await this.garageService.addVehicle(
        this.newVehicleMake.trim(),
        this.newVehicleModel.trim(),
        this.newVehicleYear,
        this.newVehicleMods.trim() || undefined,
        this.newVehicleImageUrl.trim() || undefined
      );
      this.newVehicleMake = '';
      this.newVehicleModel = '';
      this.newVehicleYear = new Date().getFullYear();
      this.newVehicleMods = '';
      this.newVehicleImageUrl = '';
      this.showAddVehicleModal = false;
      if (this.currentUser) {
        this.vehicles = await this.garageService.getUserGarage(this.currentUser.uid);
      }
    } catch (e: any) {
      this.vehicleError = e.error || e.message || 'Failed to add vehicle';
    } finally {
      this.isSubmittingVehicle = false;
    }
  }

  async deleteVehicle(gvid: number) {
    if (!confirm('Are you sure you want to delete this vehicle from your garage?')) return;
    try {
      await this.garageService.deleteVehicle(gvid);
      if (this.currentUser) {
        this.vehicles = await this.garageService.getUserGarage(this.currentUser.uid);
      }
    } catch (e) {
      console.error('Failed to delete vehicle', e);
    }
  }
}
