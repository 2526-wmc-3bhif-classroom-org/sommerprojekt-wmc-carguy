import { Component } from '@angular/core';
import { NavLink } from './nav-link.model';
import {RouterLink} from '@angular/router';
import {UserService} from '../services/user-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  imports: [
    RouterLink
  ],
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public isMenuOpen: boolean = false;
  
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

  protected readonly UserService = UserService;
}
