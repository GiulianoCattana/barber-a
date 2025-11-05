import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = false;

  constructor() {
    // Cargar preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    this.darkMode = savedTheme === 'dark';
    console.log('ThemeService initialized. Dark mode:', this.darkMode);
    this.applyTheme();
  }

  toggleTheme() {
    this.darkMode = !this.darkMode;
    console.log('Theme toggled. Dark mode:', this.darkMode);
    this.applyTheme();
    localStorage.setItem('theme', this.darkMode ? 'dark' : 'light');
  }

  isDarkMode(): boolean {
    return this.darkMode;
  }

  private applyTheme() {
    const body = document.body;
    if (this.darkMode) {
      body.classList.add('dark-theme');
      console.log('Dark theme applied. Body classes:', body.classList.toString());
    } else {
      body.classList.remove('dark-theme');
      console.log('Light theme applied. Body classes:', body.classList.toString());
    }
  }
}
