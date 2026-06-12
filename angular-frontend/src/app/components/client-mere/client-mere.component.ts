import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService, Mere } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-client-mere',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './client-mere.component.html',
  styleUrls: ['./client-mere.component.css']
})
export class ClientMereComponent implements OnInit {
  @Input() klijentId!: number;
  @Output() zatvori = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly clientService = inject(ClientService);
  readonly authService = inject(AuthService);

  readonly listaMera = signal<Mere[]>([]);
  readonly greskaPoruka = signal('');
  readonly slanje = signal(false);
  readonly prikaziFormuZaMere = signal(false);

  mereForm!: FormGroup;

  ngOnInit(): void {
    this.inicijalizujFormu();
    this.ucitajMere();
  }

  inicijalizujFormu(): void {
    this.mereForm = this.fb.group({
      tipodece: ['', [Validators.required, Validators.maxLength(100)]],
      obimgrudi: ['', [Validators.required, Validators.min(40), Validators.max(150)]],
      obimstruka: ['', [Validators.required, Validators.min(40), Validators.max(150)]],
      obimkukova: ['', [Validators.required, Validators.min(40), Validators.max(150)]],
      duzinarukava: ['', [Validators.required, Validators.min(40), Validators.max(150)]]
    });
  }

  get f() {
    return this.mereForm.controls;
  }

  ucitajMere(): void {
    this.greskaPoruka.set('');

    this.clientService.getMere(this.klijentId).subscribe({
      next: (data) => {
        this.listaMera.set(data);
      },
      error: (err) => {
        this.greskaPoruka.set(
          err.error?.poruka || 'Greška pri učitavanju mera.'
        );
      }
    });
  }

  toggleForma(): void {
    this.prikaziFormuZaMere.update(v => !v);
    if (this.prikaziFormuZaMere()) {
      this.mereForm.reset();
    }
  }

  sacuvajMere(): void {
    if (this.mereForm.invalid) {
      this.mereForm.markAllAsTouched();
      return;
    }

    this.slanje.set(true);
    this.greskaPoruka.set('');
    const noveMere: Mere = {
      klijentid: this.klijentId,
      ...this.mereForm.value
    };

    this.clientService.addMere(this.klijentId, noveMere).subscribe({
      next: () => {
        this.prikaziFormuZaMere.set(false);
        this.slanje.set(false);
        this.ucitajMere();
      },
      error: (err) => {
        if (err.status === 422 && err.error?.errors) {
          const keys = Object.keys(err.error.errors);
          this.greskaPoruka.set(err.error.errors[keys[0]][0]);
        } else {
          this.greskaPoruka.set(err.error?.poruka || 'Došlo je do greške prilikom čuvanja mera.');
        }
        this.slanje.set(false);
      }
    });
  }

  obrisiMeru(mereId: number | undefined): void {
    if (!mereId) return;
    if (confirm('Da li želite da obrišete ovu meru?')) {
      this.clientService.deleteMere(this.klijentId, mereId).subscribe({
        next: () => {
          this.listaMera.update(list => list.filter(m => m.mereid !== mereId));
        },
        error: () => {
          alert('Došlo je do greške prilikom brisanja mere.');
        }
      });
    }
  }

  zatvoriModal(): void {
    this.zatvori.emit();
  }
}
