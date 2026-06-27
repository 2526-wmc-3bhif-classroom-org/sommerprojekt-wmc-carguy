import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GuideService } from '../services/guide-service';
import { UserService } from '../services/user-service';
import { Guide, User } from '../../model';

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
  refreshedUser: User | null = null;

  // Create Form State
  showCreateForm = false;
  newGuideTitle = '';
  newGuideDescription = '';
  newGuideSteps: string[] = [''];
  isSubmitting = false;
  errorMessage = '';

  // Edit Form State
  showEditForm = false;
  editingGuide: Guide | null = null;
  editGuideTitle = '';
  editGuideDescription = '';
  editGuideSteps: string[] = [''];
  isEditSubmitting = false;
  editErrorMessage = '';

  // Delete State
  showDeleteConfirm = false;
  deletingGuide: Guide | null = null;
  isDeleting = false;

  private userService = inject(UserService);
  private guideService = inject(GuideService);

  get isLoggedIn(): boolean {
    return this.userService.isLoggedIn();
  }

  get canPostGuides(): boolean {
    const user = this.refreshedUser ?? this.userService.getCurrentUser();
    if (!user) return false;
    return user.role === 'admin' || (user.totalAura || 0) >= 100;
  }

  isAuthorOf(guide: Guide): boolean {
    const user = this.refreshedUser ?? this.userService.getCurrentUser();
    if (!user || !guide.author) return false;
    return guide.author.uid === user.uid;
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
      this.refreshedUser = loggedInUser;
      try {
        const updatedUser = await this.userService.getUserById(loggedInUser.uid);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        this.refreshedUser = updatedUser;
      } catch (err) {
        console.error('Failed to refresh user aura:', err);
      }
    }
  }

  async loadGuides() {
    try {
      this.guides = await this.guideService.getGuides();
    } catch (err) {
      console.error('Failed to load guides:', err);
    }
  }

  // --- Read Modal ---
  openGuide(guide: Guide): void {
    this.selectedGuide = guide;
    document.body.style.overflow = 'hidden';
  }

  closeGuide(): void {
    this.selectedGuide = null;
    document.body.style.overflow = 'auto';
  }

  // --- Create Modal ---
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
    } catch (err: any) {
      this.errorMessage = err?.error?.message || err?.message || 'An unexpected error occurred.';
    } finally {
      this.isSubmitting = false;
    }
  }

  // --- Edit Modal ---
  openEditForm(guide: Guide) {
    this.editingGuide = guide;
    this.editGuideTitle = guide.title;
    this.editGuideDescription = guide.description;
    this.editGuideSteps = [...guide.content];
    this.editErrorMessage = '';
    this.showEditForm = true;
    document.body.style.overflow = 'hidden';
  }

  closeEditForm() {
    this.showEditForm = false;
    this.editingGuide = null;
    document.body.style.overflow = 'auto';
  }

  addEditStep() {
    this.editGuideSteps.push('');
  }

  removeEditStep(index: number) {
    if (this.editGuideSteps.length > 1) {
      this.editGuideSteps.splice(index, 1);
    } else {
      this.editGuideSteps[0] = '';
    }
  }

  async submitEdit() {
    if (!this.editingGuide) return;

    const title = this.editGuideTitle.trim();
    const description = this.editGuideDescription.trim();
    const steps = this.editGuideSteps.map(s => s.trim()).filter(s => s !== '');

    if (!title || !description || steps.length === 0) {
      this.editErrorMessage = 'Please fill out all fields and add at least one step.';
      return;
    }

    this.isEditSubmitting = true;
    this.editErrorMessage = '';

    try {
      await this.guideService.updateGuide(this.editingGuide.id, title, description, steps);
      this.closeEditForm();
      await this.loadGuides();
    } catch (err: any) {
      this.editErrorMessage = err?.error?.message || err?.message || 'An unexpected error occurred.';
    } finally {
      this.isEditSubmitting = false;
    }
  }

  // --- Delete Confirm Modal ---
  openDeleteConfirm(guide: Guide) {
    this.deletingGuide = guide;
    this.showDeleteConfirm = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteConfirm() {
    this.showDeleteConfirm = false;
    this.deletingGuide = null;
    document.body.style.overflow = 'auto';
  }

  async confirmDelete() {
    if (!this.deletingGuide) return;
    this.isDeleting = true;
    try {
      await this.guideService.deleteGuide(this.deletingGuide.id);
      this.closeDeleteConfirm();
      await this.loadGuides();
    } catch (err: any) {
      console.error('Failed to delete guide:', err);
    } finally {
      this.isDeleting = false;
    }
  }

  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }
}
