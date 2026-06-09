import { Component, OnDestroy, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GuideService, Guide } from '../services/guide-service';
import { UserService } from '../services/user-service';

@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './Guides.html',
  styleUrl: './Guides.css'
})
export class GuidesComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  selectedGuide: Guide | null = null;
  guides: Guide[] = [];

  // Form State
  showCreateForm = false;
  newGuideTitle = '';
  newGuideDescription = '';
  newGuideSteps: string[] = [''];
  isSubmitting = false;
  errorMessage = '';

  get isLoggedIn(): boolean {
    return UserService.isLoggedIn();
  }

  get canPostGuides(): boolean {
    const user = UserService.getCurrentUser();
    return user !== null && ((user.totalAura || 0) >= 100 || user.role === 'admin');
  }

  async ngOnInit() {
    await this.refreshUserAura();
    await this.loadGuides();
  }

  async refreshUserAura() {
    const loggedInUser = UserService.getCurrentUser();
    if (loggedInUser) {
      try {
        const updatedUser = await UserService.getUserById(loggedInUser.uid);
        localStorage.setItem("currentUser", JSON.stringify(updatedUser));
        this.cdr.detectChanges();
      } catch (err) {
        console.error("Failed to refresh user aura:", err);
      }
    }
  }

  async loadGuides() {
    try {
      this.guides = await GuideService.getGuides();
      this.cdr.detectChanges();
    } catch (err) {
      console.error("Failed to load guides:", err);
    }
  }

  openGuide(guide: Guide): void {
    this.selectedGuide = guide;
    // Prevent scrolling on the background when modal is open
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeGuide(): void {
    this.selectedGuide = null;
    // Restore scrolling
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }

  openCreateForm() {
    this.showCreateForm = true;
    this.newGuideTitle = '';
    this.newGuideDescription = '';
    this.newGuideSteps = [''];
    this.errorMessage = '';
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  closeCreateForm() {
    this.showCreateForm = false;
    document.body.style.overflow = 'auto';
    this.cdr.detectChanges();
  }

  addStep() {
    this.newGuideSteps.push('');
    this.cdr.detectChanges();
  }

  removeStep(index: number) {
    if (this.newGuideSteps.length > 1) {
      this.newGuideSteps.splice(index, 1);
    } else {
      this.newGuideSteps[0] = '';
    }
    this.cdr.detectChanges();
  }

  async submitGuide() {
    const title = this.newGuideTitle.trim();
    const description = this.newGuideDescription.trim();
    const steps = this.newGuideSteps.map(s => s.trim()).filter(s => s !== '');

    if (!title || !description || steps.length === 0) {
      this.errorMessage = 'Please fill out all fields and add at least one step.';
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      await GuideService.createGuide(title, description, steps);
      this.closeCreateForm();
      await this.loadGuides();
    } catch (err) {
      if (err instanceof Error) {
        this.errorMessage = err.message;
      } else {
        this.errorMessage = 'An unexpected error occurred.';
      }
      this.cdr.detectChanges();
    } finally {
      this.isSubmitting = false;
      this.cdr.detectChanges();
    }
  }

  // Ensure we restore scrolling if the user navigates away while the modal is open
  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }
}
