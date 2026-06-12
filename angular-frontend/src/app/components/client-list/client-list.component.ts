import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService, Klijent } from '../../services/client.service';
import { AuthService } from '../../services/auth.service';
import { ClientFormComponent } from '../client-form/client-form.component';
import { ClientMereComponent } from '../client-mere/client-mere.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ClientFormComponent, ClientMereComponent],
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.css']
})
export class ClientListComponent implements OnInit {
  private readonly clientService = inject(ClientService);
  readonly authService = inject(AuthService);

  readonly klijenti = signal<Klijent[]>([]);
  readonly filtriraniKlijenti = signal<Klijent[]>([]);
  readonly greskaPoruka = signal('');

  pretragaText = '';
  odabraniKlijentIdForMere: number | null = null;
  odabraniKlijentZaIzmenu: Klijent | null = null;
  prikaziFormu = false;

  ngOnInit(): void {
    this.ucitajKlijente();
  }

  ucitajKlijente(): void {
    this.greskaPoruka.set('');

    this.clientService.getClients().subscribe({
      next: (data) => {
        this.klijenti.set(data);
        this.filtriraniKlijenti.set(data);
      },
      error: (err) => {
        this.greskaPoruka.set('Greška pri učitavanju klijenata');
      }
    });
  }

  pretrazi(): void {
    const q = this.pretragaText.toLowerCase().trim();
    if (!q) {
      this.filtriraniKlijenti.set(this.klijenti());
    } else {
      this.filtriraniKlijenti.set(this.klijenti().filter(k =>
        k.ime.toLowerCase().includes(q) ||
        k.prezime.toLowerCase().includes(q) ||
        k.email.toLowerCase().includes(q) ||
        k.telefon.includes(q)
      ));
    }
  }

  obrisiKlijenta(id: number | undefined): void {
    if (!id) return;
    if (confirm('Da li ste sigurni da želite da obrišete ovog klijenta?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.klijenti.update(list => list.filter(k => k.klijentid !== id));
          this.pretrazi();
        }
      });
    }
  }

  otvoriDodavanje(): void {
    this.odabraniKlijentZaIzmenu = null;
    this.prikaziFormu = true;
  }

  otvoriIzmenu(klijent: Klijent): void {
    this.odabraniKlijentZaIzmenu = { ...klijent };
    this.prikaziFormu = true;
  }

  zatvoriFormu(sacuvano: boolean): void {
    this.prikaziFormu = false;
    this.odabraniKlijentZaIzmenu = null;
    if (sacuvano) {
      this.ucitajKlijente();
    }
  }

  otvoriMere(id: number | undefined): void {
    this.odabraniKlijentIdForMere = id ? id : null;
  }

  zatvoriMere(): void {
    this.odabraniKlijentIdForMere = null;
  }
}
