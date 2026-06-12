import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface Korisnik {
  korisnikid: number;
  username: string;
  uloga: 'admin' | 'krojac';
}

export interface LoginResponse {
  token: string;
  korisnik: Korisnik;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:8000/api';
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  private readonly storage = sessionStorage;

  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly korisnikSignal = signal<Korisnik | null>(null);
  private readonly tokenSignal = signal<string | null>(null);

  readonly isLoggedIn = computed(() => !!this.tokenSignal() && !!this.korisnikSignal());
  readonly isAdmin = computed(() => this.korisnikSignal()?.uloga === 'admin');
  readonly canEdit = computed(() => this.korisnikSignal()?.uloga === 'krojac');
  readonly korisnik = computed(() => this.korisnikSignal());

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);

    const token = this.storage.getItem(this.tokenKey);
    const userRaw = this.storage.getItem(this.userKey);
    const user = userRaw ? JSON.parse(userRaw) as Korisnik : null;
    
    this.tokenSignal.set(token);
    this.korisnikSignal.set(user);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap((res) => {
        this.storage.setItem(this.tokenKey, res.token);
        this.storage.setItem(this.userKey, JSON.stringify(res.korisnik));
        this.tokenSignal.set(res.token);
        this.korisnikSignal.set(res.korisnik);
      })
    );
  }

  logout(): void {
    const token = this.tokenSignal();
    if (token) {
      this.http.post(`${this.apiUrl}/logout`, {}).subscribe({
        error: () => this.clearSession(),
        complete: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.storage.removeItem(this.tokenKey);
    this.storage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.tokenSignal.set(null);
    this.korisnikSignal.set(null);
    this.router.navigate(['/login']);
  }
}
