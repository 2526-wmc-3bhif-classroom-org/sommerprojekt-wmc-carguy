import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunityService} from '../services/community-service';

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './communities-directory.html'
})
export class CommunitiesRepository {
  private communityService = inject(CommunityService);

  featured = this.communityService.getFeatured();
  all = this.communityService.getAll();
  categories = this.communityService.getCategories();
  trending = this.communityService.getTrending();

  count = this.all.length;

  // Helper for the "Letter Avatar"
  getInitials(name: string): string {
    return name.substring(0, 2).toUpperCase();
  }
}
