import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GuideService } from '../services/guide-service';
import { UserService } from '../services/user-service';
import { Guide } from '../../model';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './Guides.html',
  styleUrl: './Guides.css'
})
export class GuidesComponent implements OnInit, OnDestroy {
  selectedGuide: Guide | null = null;
  guides: Guide[] = [];
  isLoading = true;

  // Refreshed user state (fetched from server on init)
  private refreshedUser: import('../../model').User | null = null;

  // Form State
  showCreateForm = false;
  newGuideTitle = '';
  newGuideDescription = '';
  newGuideSteps: string[] = [''];
  isSubmitting = false;
  errorMessage = '';

  private userService = inject(UserService);
  private guideService = inject(GuideService);

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get canPostGuides(): boolean {
    // Use the freshly fetched user if available, fall back to stored user
    const user = this.refreshedUser ?? this.userService.getCurrentUser();
    if (!user) return false;
    return user.role === 'admin' || (user.totalAura || 0) >= 100;
  }

  async ngOnInit() {
    this.isLoading = true;
    await this.refreshUserAura();
    await this.loadGuides();
    this.isLoading = false;
  }

  async refreshUserAura() {
    const loggedInUser = this.userService.getCurrentUser();
    if (loggedInUser) {
      // Set immediately from localStorage as fallback
      this.refreshedUser = loggedInUser;
      try {
        const updatedUser = await this.userService.getUserById(loggedInUser.uid);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        // Store in component so canPostGuides uses fresh data immediately
        this.refreshedUser = updatedUser;
      } catch (err) {
        console.error("Failed to refresh user aura:", err);
      }
    }
  }

  async loadGuides() {
    try {
      this.guides = await this.guideService.getGuides();
    } catch (err) {
      console.error("Failed to load guides:", err);
    }
  }

  openGuide(guide: Guide): void {
    this.selectedGuide = guide;
    // Prevent scrolling on the background when modal is open
    document.body.style.overflow = 'hidden';
  }

  closeGuide(): void {
    this.selectedGuide = null;
    // Restore scrolling
    document.body.style.overflow = 'auto';
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.newGuideTitle = '';
    this.newGuideDescription = '';
    this.newGuideSteps = [''];
    this.errorMessage = '';
    document.body.style.overflow = 'hidden';
  }

  closeCreateForm() {
    this.showCreateForm = false;
    document.body.style.overflow = 'auto';
  }

  addStep() {
    this.newGuideSteps.push('');
  }

  removeStep(index: number) {
    if (this.newGuideSteps.length > 1) {
      this.newGuideSteps.splice(index, 1);
    } else {
      this.newGuideSteps[0] = '';
    }
  }

  async submitGuide() {
    const title = this.newGuideTitle.trim();
    const description = this.newGuideDescription.trim();
    const steps = this.newGuideSteps.map(s => s.trim()).filter(s => s !== '');

    if (!title || !description || steps.length === 0) {
      this.errorMessage = 'Please fill out all fields and add at least one step.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    try {
      await this.guideService.createGuide(title, description, steps);
      this.closeCreateForm();
      await this.loadGuides();
    } catch (err) {
      if (err instanceof Error) {
        this.errorMessage = err.message;
      } else {
        this.errorMessage = 'An unexpected error occurred.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  // Ensure we restore scrolling if the user navigates away while the modal is open
  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }
}
