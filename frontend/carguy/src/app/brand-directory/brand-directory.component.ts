import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ForumService } from '../services/forum-service';
import { Forum } from '../../model';

@Component({
  selector: 'app-brand-directory',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './brand-directory.component.html',
  styleUrls: ['./brand-directory.component.css']
})
export class BrandDirectoryComponent {

  forums: Forum[] = [];

  async gOnInit() {
    try {
      this.forums = await ForumService.getAllForums();
    } catch (error) {
      console.error('Failed to load forums', error);
    }
  }
}
