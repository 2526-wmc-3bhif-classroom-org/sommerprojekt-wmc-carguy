import { Component, OnInit, OnDestroy, inject, HostListener, ElementRef } from '@angular/core';
import { NavLink } from './nav-link.model';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../services/user-service';
import { SearchService, SearchResults } from '../services/search-service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../services/theme-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [
    RouterLink,
    CommonModule
  ],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  public isMenuOpen: boolean = false;
  
  public searchQuery: string = '';
  public suggestions: SearchResults | null = null;
  public showDropdown: boolean = false;
  public activeSuggestionIndex: number = -1;

  private searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;

  private router = inject(Router);
  private elementRef = inject(ElementRef);
  protected themeService = inject(ThemeService);

  public ngOnInit(): void {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(async (query) => {
      try {
        this.suggestions = await SearchService.search(query);
      } catch (err) {
        console.error("Failed to load search suggestions:", err);
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  public onClickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  public onFocus(): void {
    if (this.searchQuery.trim().length > 0) {
      this.showDropdown = true;
    }
  }

  public onSearchInput(query: string): void {
    this.searchQuery = query;
    this.activeSuggestionIndex = -1; // Reset selection index
    if (query.trim().length > 0) {
      this.showDropdown = true;
      this.searchSubject.next(query);
    } else {
      this.suggestions = null;
      this.showDropdown = false;
    }
  }

  get combinedSuggestions() {
    const list: { type: 'community' | 'user' | 'post'; id: number; label: string; url: string }[] = [];
    
    if (this.suggestions) {
      this.suggestions.communities.slice(0, 3).forEach(c => {
        list.push({ type: 'community', id: c.forumId, label: c.name, url: `/community/${c.forumId}` });
      });
      this.suggestions.users.slice(0, 3).forEach(u => {
        list.push({ type: 'user', id: u.uid, label: `u/${u.username} (${u.publicname})`, url: `/profile/${u.uid}` });
      });
      this.suggestions.posts.slice(0, 3).forEach(p => {
        list.push({ type: 'post', id: p.pid, label: p.title || p.content.substring(0, 40) + '...', url: `/post/${p.pid}` });
      });
    }
    return list;
  }

  public handleKeydown(event: KeyboardEvent): void {
    if (!this.showDropdown) return;

    const list = this.combinedSuggestions;
    const totalCount = list.length + 1; // +1 for "See all results"

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeSuggestionIndex = (this.activeSuggestionIndex + 1);
      if (this.activeSuggestionIndex >= totalCount) {
        this.activeSuggestionIndex = 0;
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeSuggestionIndex--;
      if (this.activeSuggestionIndex < 0) {
        this.activeSuggestionIndex = totalCount - 1;
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.activeSuggestionIndex >= 0 && this.activeSuggestionIndex < list.length) {
        const selected = list[this.activeSuggestionIndex];
        this.navigateTo(selected.url);
      } else {
        this.goToSearchPage();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.closeDropdown();
      (event.target as HTMLInputElement).blur();
    }
  }

  public navigateTo(url: string): void {
    this.closeDropdown();
    this.router.navigateByUrl(url);
  }

  public goToSearchPage(): void {
    if (this.searchQuery.trim().length > 0) {
      this.closeDropdown();
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
    }
  }

  public closeDropdown(): void {
    this.showDropdown = false;
    this.activeSuggestionIndex = -1;
  }

  get isLoggedIn(): boolean {
    return this.UserService.isLoggedIn();
  }

  // Typed array of links
  public navLinks: NavLink[] = [
    { label: 'Brands', path: '/' },
    { label: 'Communities', path: '/communities' },
    { label: 'Guides', path: '/guides' },
    { label: 'Profile', path: '/profile' }
  ];

  public toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  public closeMenu(): void {
    this.isMenuOpen = false;
  }

  public toggleTheme(event: MouseEvent): void {
    this.themeService.toggleTheme(event);
  }

  protected readonly UserService = UserService;
}
