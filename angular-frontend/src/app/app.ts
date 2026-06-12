import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly authService = inject(AuthService);
  readonly isLoggedIn = this.authService.isLoggedIn;
  readonly isAdmin = this.authService.isAdmin;
  readonly korisnik = this.authService.korisnik;
  readonly menuOtvoren = signal(false);

  toggleMenu(): void {
    this.menuOtvoren.update(v => !v);
  }

  zatvoriMenu(): void {
    this.menuOtvoren.set(false);
  }

  odjaviSe(): void {
    this.authService.logout();
    this.menuOtvoren.set(false);
  }
}
