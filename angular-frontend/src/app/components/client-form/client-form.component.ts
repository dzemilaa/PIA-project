import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, Klijent } from '../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  @Input() klijent: Klijent | null = null;
  @Output() zatvori = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  private readonly lettersPattern = /^[a-zA-ZčćžšđČĆŽŠĐ]+(?:\s+[a-zA-ZčćžšđČĆŽŠĐ]+)*$/;
  private readonly phonePattern = /^\d+$/;

  readonly klijentForm: FormGroup = this.fb.group({
    ime: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(this.lettersPattern)]],
    prezime: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(this.lettersPattern)]],
    telefon: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(this.phonePattern)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    napomene: ['']
  });

  readonly greskaPoruka = signal('');
  readonly slanje = signal(false);

  ngOnInit(): void {
    // Postavi inicijalne vrijednosti iz @Input klijenta ako postoji
    if (this.klijent) {
      this.klijentForm.patchValue({
        ime: this.klijent.ime,
        prezime: this.klijent.prezime,
        telefon: this.klijent.telefon,
        email: this.klijent.email,
        napomene: this.klijent.napomene
      });
    }
  }

  // Helper metode za lakši pristup poljima u HTML-u
  get f() {
    return this.klijentForm.controls;
  }

  potvrdi(): void {
    if (this.klijentForm.invalid) {
      this.klijentForm.markAllAsTouched();
      return;
    }

    this.slanje.set(true);
    this.greskaPoruka.set('');
    const formValues: Klijent = this.klijentForm.value;

    const zahtev = this.klijent?.klijentid
      ? this.clientService.updateClient(this.klijent.klijentid, formValues)
      : this.clientService.createClient(formValues);

    zahtev.subscribe({
      next: () => {
        this.slanje.set(false);
        this.zatvori.emit(true);
      },
      error: (err) => {
        this.slanje.set(false);
        this.obradiBackendGresku(err);
      }
    });
  }

  obradiBackendGresku(err: any): void {
    if (err.status === 422 && err.error?.errors) {
      const keys = Object.keys(err.error.errors);
      if (keys.length > 0) {
        this.greskaPoruka.set(err.error.errors[keys[0]][0]);
      }
    } else {
      this.greskaPoruka.set(err.error?.poruka || 'Došlo je do greške prilikom čuvanja podataka klijenta.');
    }
  }

  otkazi(): void {
    this.zatvori.emit(false);
  }
}
