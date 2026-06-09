import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SearchService, SearchResults } from '../services/search-service';
import { Post, User, Forum } from '../../model';

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './search-results.html',
  styleUrls: ['./search-results.css']
})
export class SearchResultsComponent implements OnInit {
  searchQuery: string = '';
  searchResults: SearchResults = { posts: [], users: [], communities: [] };
  isLoading: boolean = false;
  activeTab: 'all' | 'posts' | 'communities' | 'users' = 'all';

  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.route.queryParamMap.subscribe(async params => {
      const q = params.get('q') || '';
      this.searchQuery = q.trim();
      
      if (this.searchQuery) {
        await this.performSearch();
      } else {
        this.searchResults = { posts: [], users: [], communities: [] };
        this.cdr.detectChanges();
      }
    });
  }

  async performSearch() {
    this.isLoading = true;
    this.cdr.detectChanges();
    try {
      this.searchResults = await SearchService.search(this.searchQuery);
    } catch (error) {
      console.error('Failed to retrieve search results:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  changeTab(tab: 'all' | 'posts' | 'communities' | 'users') {
    this.activeTab = tab;
    this.cdr.detectChanges();
  }

  getInitials(name: string): string {
    if (!name) return 'C';
    return name.substring(0, 2).toUpperCase();
  }
}
