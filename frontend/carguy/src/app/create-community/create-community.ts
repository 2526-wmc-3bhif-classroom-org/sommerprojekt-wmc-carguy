import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { UserService } from '../services/user-service';
import { User } from '../../model';

@Component({
  selector: 'app-create-community',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-community.html',
  styleUrl: './create-community.css'
})
export class CreateCommunityComponent {
  name: string = '';
  description: string = '';
  errorMessage: string | null = null;
  isLoading: boolean = false;

  constructor(private router: Router) {}

  async createCommunity() {
    this.errorMessage = null;
    const currentUser: User | null = UserService.getCurrentUser();

    if (!currentUser) {
      this.errorMessage = 'You must be logged in to create a community.';
      return;
    }

    this.isLoading = true;

    try {
      const res = await ForumService.createForum(this.name, currentUser, this.description);
      if (res && res.forumId) {
        this.router.navigate(['/community', res.forumId]);
      } else {
        this.router.navigate(['/communities']);
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Failed to create community. Please try again.';
      console.error('Failed to create community', error);
    } finally {
      this.isLoading = false;
    }
  }
}
