import { Component, signal, effect } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { BrandDirectoryComponent } from '../brand-directory/brand-directory.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, BrandDirectoryComponent],
  templateUrl: '../app.html',
  styleUrl: './app.component.css'
})

export class App {
  title = signal('CarGuy');
  darkMode = signal<boolean>(true);

  constructor() {
    effect((): void => {
      const theme: 'carguy' | 'light' = this.darkMode() ? 'carguy' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  toggleTheme(): void {
    this.darkMode.update(v => !v);
  }
}
