import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService, Narudzbina } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { OrderFormComponent } from '../order-form/order-form.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule, OrderFormComponent],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  readonly authService = inject(AuthService);

  readonly narudzbine = signal<Narudzbina[]>([]);
  readonly filtriraneNarudzbine = signal<Narudzbina[]>([]);
  readonly greskaPoruka = signal('');

  pretragaText = '';
  odabranaNarudzbinaZaIzmenu: Narudzbina | null = null;
  prikaziFormu = false;

  ngOnInit(): void {
    this.ucitajNarudzbine();
  }

  ucitajNarudzbine(): void {
    this.greskaPoruka.set('');

    this.orderService.getOrders().subscribe({
      next: (data) => {
        this.narudzbine.set(data);
        this.filtriraneNarudzbine.set(data);
      },
      error: () => {
        this.greskaPoruka.set('Greška pri učitavanju narudžbina');
      }
    });
  }

  pretrazi(): void {
    const q = this.pretragaText.toLowerCase().trim();
    if (!q) {
      this.filtriraneNarudzbine.set(this.narudzbine());
    } else {
      this.filtriraneNarudzbine.set(this.narudzbine().filter(n =>
        n.tipodece.toLowerCase().includes(q) ||
        (n.klijentImePrezime && n.klijentImePrezime.toLowerCase().includes(q)) ||
        n.status.toLowerCase().includes(q)
      ));
    }
  }

  statusKlasa(status: string): string {
    switch (status) {
      case 'u obradi':  return 'badge badge-yellow';
      case 'u izradi':  return 'badge badge-blue';
      case 'završeno':  return 'badge badge-green';
      case 'otkazano':  return 'badge badge-red';
      default:          return 'badge badge-gray';
    }
  }

  promeniStatus(order: Narudzbina, noviStatus: string): void {
    if (!order.narudzbinaid) return;
    this.orderService.updateStatus(order.narudzbinaid, noviStatus).subscribe({
      next: () => {
        this.narudzbine.update(list =>
          list.map(n => n.narudzbinaid === order.narudzbinaid ? { ...n, status: noviStatus as Narudzbina['status'] } : n)
        );
        this.pretrazi();
      }
    });
  }

  obrisiNarudzbinu(id: number | undefined): void {
    if (!id) return;
    if (confirm('Da li ste sigurni da želite da obrišete ovu narudžbinu?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.narudzbine.update(list => list.filter(n => n.narudzbinaid !== id));
          this.pretrazi();
        }
      });
    }
  }

  otvoriDodavanje(): void {
    this.odabranaNarudzbinaZaIzmenu = null;
    this.prikaziFormu = true;
  }

  otvoriIzmenu(order: Narudzbina): void {
    this.odabranaNarudzbinaZaIzmenu = { ...order };
    this.prikaziFormu = true;
  }

  zatvoriFormu(sacuvano: boolean): void {
    this.prikaziFormu = false;
    this.odabranaNarudzbinaZaIzmenu = null;
    if (sacuvano) {
      this.ucitajNarudzbine();
    }
  }
}
