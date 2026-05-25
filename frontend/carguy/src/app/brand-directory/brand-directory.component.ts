import {ChangeDetectorRef, Component, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { PostService } from '../services/post-service';
import { Forum, Post } from '../../model';

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-directory.component.html',
  styleUrls: ['./brand-directory.component.css']
})
export class BrandDirectoryComponent {

  forums: Forum[] = [];
  trendingForums: Forum[] = [];
  trendingPosts: Post[] = [];

  private cdr = inject(ChangeDetectorRef);

  async ngOnInit() {
    try {
      this.forums = await ForumService.getAllForums();
      this.trendingForums = await ForumService.getTrendingForums(4);
      this.trendingPosts = await PostService.getTrendingPosts(4);
      this.cdr.detectChanges();
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  }
}
