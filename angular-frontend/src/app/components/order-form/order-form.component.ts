import { Component, Input, Output, EventEmitter, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { OrderService, Narudzbina } from '../../services/order.service';
import { ClientService, Klijent, Mere } from '../../services/client.service';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  @Input() narudzbina: Narudzbina | null = null;
  @Output() zatvori = new EventEmitter<boolean>();

  private readonly fb = inject(FormBuilder);
  private readonly orderService = inject(OrderService);
  private readonly clientService = inject(ClientService);

  readonly klijenti = signal<Klijent[]>([]);
  readonly klijentMere = signal<Mere[]>([]);
  readonly greskaPoruka = signal('');
  readonly slanje = signal(false);
  readonly danas = new Date().toISOString().split('T')[0];

  orderForm!: FormGroup;
  odabraneMereInfo: Mere | null = null;

  ngOnInit(): void {
    this.ucitajKlijente();
    this.inicijalizujFormu();
  }

  inicijalizujFormu(): void {
    this.orderForm = this.fb.group({
      klijentid: [this.narudzbina ? this.narudzbina.klijentid : '', [Validators.required]],
      tipodece: [this.narudzbina ? this.narudzbina.tipodece : '', [Validators.required, Validators.maxLength(100)]],
      rokizrade: [this.narudzbina ? this.formatDate(this.narudzbina.rokizrade) : '', [Validators.required]],
      rokprobe: [this.narudzbina ? this.formatDate(this.narudzbina.rokprobe) : '', [Validators.required]],
      rokisporuke: [this.narudzbina ? this.formatDate(this.narudzbina.rokisporuke) : '', [Validators.required]],
      cena: [this.narudzbina ? this.narudzbina.cena : '', [Validators.required, Validators.min(0.01)]],
      status: [this.narudzbina ? this.narudzbina.status : 'u obradi', [Validators.required]],
      napomene: [this.narudzbina ? this.narudzbina.napomene : '']
    }, { validators: this.datumiNarudzbineValidator() });

    if (!this.narudzbina) {
      this.orderForm.get('status')?.disable();
    }

    // Ako menjamo postojeću narudžbinu, odmah učitaj mere klijenta
    if (this.narudzbina) {
      this.ucitajMereKlijenta(this.narudzbina.klijentid);
    }
  }

  get f() {
    return this.orderForm.controls;
  }

  get klijentNemaMere(): boolean {
    return !!this.orderForm.get('klijentid')?.value && this.klijentMere().length === 0;
  }

  ucitajKlijente(): void {
    this.clientService.getClients().subscribe({
      next: (data) => {
        this.klijenti.set(data);
      },
      error: () => {
        this.greskaPoruka.set('Nije moguće učitati spisak klijenata.');
      }
    });
  }

  onKlijentChange(): void {
    const kId = +this.orderForm.get('klijentid')?.value;
    this.klijentMere.set([]);
    this.odabraneMereInfo = null;
    this.orderForm.patchValue({ tipodece: '' });
    this.orderForm.get('tipodece')?.updateValueAndValidity();

    if (kId) {
      this.ucitajMereKlijenta(kId);
    }
  }

  ucitajMereKlijenta(kId: number): void {
    this.clientService.getMere(kId).subscribe({
      next: (data) => {
        this.klijentMere.set(data);
        const tipOdeceControl = this.orderForm.get('tipodece');

        if (data.length === 0) {
          this.odabraneMereInfo = null;
          tipOdeceControl?.setErrors({ noMeasures: true });
          tipOdeceControl?.markAsTouched();
          return;
        }

        tipOdeceControl?.updateValueAndValidity();

        if (this.narudzbina) {
          const aktivnaMera = data.find(m => m.tipodece === this.narudzbina?.tipodece);
          if (aktivnaMera) {
            this.odabraneMereInfo = aktivnaMera;
          } else {
            tipOdeceControl?.setErrors({ measureRequired: true });
          }
        }
      },
      error: () => this.greskaPoruka.set('Nije moguće učitati mere klijenta.')
    });
  }

  onTipOdeceChange(): void {
    const tip = this.orderForm.get('tipodece')?.value;
    const aktivnaMera = this.klijentMere().find(m => m.tipodece === tip);
    this.odabraneMereInfo = aktivnaMera ? aktivnaMera : null;
    this.orderForm.get('tipodece')?.setErrors(aktivnaMera ? null : { measureRequired: true });
  }

  potvrdi(): void {
    this.validirajMereZaNarudzbinu();

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.slanje.set(true);
    this.greskaPoruka.set('');
    const raw = this.orderForm.getRawValue();
    const formValues: Narudzbina = {
      klijentid: +raw.klijentid,
      tipodece: raw.tipodece,
      rokizrade: raw.rokizrade,
      rokprobe: raw.rokprobe,
      rokisporuke: raw.rokisporuke,
      cena: raw.cena,
      status: raw.status,
      napomene: raw.napomene,
    };
    if (!this.narudzbina) {
      formValues.status = 'u obradi';
    }

    const zahtev = this.narudzbina?.narudzbinaid
      ? this.orderService.updateOrder(this.narudzbina.narudzbinaid, formValues)
      : this.orderService.createOrder(formValues);

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
      this.greskaPoruka.set(err.error.errors[keys[0]][0]);
    } else {
      this.greskaPoruka.set(err.error?.poruka || 'Došlo je do greške prilikom snimanja narudžbine.');
    }
  }

  otkazi(): void {
    this.zatvori.emit(false);
  }

  private formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  }

  private validirajMereZaNarudzbinu(): void {
    const tipOdeceControl = this.orderForm.get('tipodece');
    const klijentId = this.orderForm.get('klijentid')?.value;

    if (!klijentId) return;

    if (this.klijentMere().length === 0) {
      tipOdeceControl?.setErrors({ noMeasures: true });
      this.greskaPoruka.set('Izabrani klijent nema unet tip odeće i mere. Unesite ih u formi za mere klijenta.');
      return;
    }

    if (!this.odabraneMereInfo) {
      tipOdeceControl?.setErrors({ measureRequired: true });
      this.greskaPoruka.set('Izaberite tip odeće iz unetih mera klijenta.');
    }
  }

  private datumiNarudzbineValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const rokizrade = control.get('rokizrade')?.value;
      const rokprobe = control.get('rokprobe')?.value;
      const rokisporuke = control.get('rokisporuke')?.value;
      const errors: ValidationErrors = {};

      if ([rokizrade, rokprobe, rokisporuke].some(date => date && date < this.danas)) {
        errors['previousDate'] = true;
      }

      if (rokizrade && rokprobe && rokizrade > rokprobe) {
        errors['dateOrder'] = true;
      }

      if (rokprobe && rokisporuke && rokprobe > rokisporuke) {
        errors['dateOrder'] = true;
      }

      return Object.keys(errors).length ? errors : null;
    };
  }
}
