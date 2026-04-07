import { Component, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import {BrandDirectoryComponent} from '../brand-directory/brand-directory.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class App {
  // Using Angular Signals for the theme state
  darkMode = signal<boolean>(true);

  constructor() {
    // Effect to update the data-theme attribute on the body for daisyUI/CSS
    effect(() => {
      const theme = this.darkMode() ? 'carguy' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggleTheme() {
    this.darkMode.update(v => !v);
  }
}
