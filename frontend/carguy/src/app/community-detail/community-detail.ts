import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { Forum } from '../../model';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './community-detail.html',
  styleUrls: ['./community-detail.css']
})
export class CommunityDetailComponent implements OnInit {
  community: Forum | null = null;
  isLoading = true;
  private cdr = inject(ChangeDetectorRef);

  constructor(private route: ActivatedRoute) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      try {
        const id = Number(idParam);
        this.community = await ForumService.getForumById(id);
      } catch (error) {
        console.error('Failed to load community details', error);
      } finally {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } else {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  getInitials(name?: string): string {
    if (!name) return 'C';
    return name.substring(0, 2).toUpperCase();
  }
}
