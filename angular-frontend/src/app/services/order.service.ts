import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Narudzbina {
  narudzbinaid?: number;
  klijentid: number;
  klijentImePrezime?: string;
  tipodece: string; // opis odeće
  datumkreiranja?: string;
  rokprobe?: string;
  rokizrade?: string;
  rokisporuke: string;
  status: 'u obradi' | 'u izradi' | 'završeno' | 'otkazano';
  napomene?: string;
  cena: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = 'http://localhost:8000/api/narudzbine';

  constructor(private http: HttpClient) {}

  getOrders(): Observable<Narudzbina[]> {
    return this.http.get<Narudzbina[]>(this.apiUrl);
  }

  getOrder(id: number): Observable<Narudzbina> {
    return this.http.get<Narudzbina>(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Narudzbina): Observable<any> {
    return this.http.post(this.apiUrl, order);
  }

  updateOrder(id: number, order: Narudzbina): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, order);
  }

  deleteOrder(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
