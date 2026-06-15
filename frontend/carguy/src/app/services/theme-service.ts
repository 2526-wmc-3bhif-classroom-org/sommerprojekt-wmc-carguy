import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSignal = signal<boolean>(localStorage.getItem('theme') !== 'light');

  constructor() {
    effect(() => {
      const theme = this.darkModeSignal() ? 'carguy' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme === 'carguy' ? 'dark' : 'light');
    });
  }

  get isDarkMode(): boolean {
    return this.darkModeSignal();
  }

  public toggleTheme(event: MouseEvent): void {
    this.darkModeSignal.set(!this.darkModeSignal());
  }
}
