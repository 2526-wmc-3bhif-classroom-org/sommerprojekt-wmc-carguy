import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user-service';
import { User } from '../../model';
import { getUserBadges, Badge } from '../utils/badge';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './leaderboard.html',
})
export class LeaderboardComponent implements OnInit {
  users: User[] = [];
  isLoading = true;

  private userService = inject(UserService);

  getUserBadges(user?: any | null): Badge[] {
    return getUserBadges(user);
  }

  async ngOnInit() {
    try {
      const allUsers = await this.userService.getAllUsers();
      // Sort users by totalAura descending
      this.users = allUsers.sort((a, b) => (b.totalAura || 0) - (a.totalAura || 0));
    } catch (e) {
      console.error('Failed to load leaderboard', e);
    } finally {
      this.isLoading = false;
    }
  }
}
