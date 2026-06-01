import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly usernamePattern = /^[a-zA-ZčćžšđČĆŽŠĐ]+$/;

  readonly loginForm: FormGroup = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      Validators.pattern(this.usernamePattern)
    ]],
    password: ['', [Validators.required]]
  });

  readonly greskaPoruka = signal('');
  readonly slanje = signal(false);

  get f() {
    return this.loginForm.controls;
  }

  prijaviSe(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.slanje.set(true);
    this.greskaPoruka.set('');

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: () => {
        this.slanje.set(false);
        this.router.navigate(['/klijenti']);
      },
      error: (err) => {
        this.slanje.set(false);
        if (err.status === 422 && err.error?.errors?.username) {
          this.greskaPoruka.set(err.error.errors.username[0]);
        } else {
          this.greskaPoruka.set(err.error?.poruka || 'Greška pri prijavi. Proverite podatke.');
        }
      }
    });
  }
}
