import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Klijent {
  klijentid?: number;
  ime: string;
  prezime: string;
  telefon: string;
  email: string;
  napomene?: string;
}

export interface Mere {
  mereid?: number;
  klijentid: number;
  tipodece: string;
  obimgrudi: number;
  obimstruka: number;
  obimkukova: number;
  duzinarukava: number;
  datumunosa?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = 'http://localhost:8000/api/klijenti';

  constructor(private http: HttpClient) {}

  getClients(): Observable<Klijent[]> {
    return this.http.get<Klijent[]>(this.apiUrl);
  }

  getClient(id: number): Observable<Klijent> {
    return this.http.get<Klijent>(`${this.apiUrl}/${id}`);
  }

  createClient(client: Klijent): Observable<any> {
    return this.http.post(this.apiUrl, client);
  }

  updateClient(id: number, client: Klijent): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, client);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getMere(clientId: number): Observable<Mere[]> {
    return this.http.get<Mere[]>(`${this.apiUrl}/${clientId}/mere`);
  }

  addMere(clientId: number, mere: Mere): Observable<any> {
    return this.http.post(`${this.apiUrl}/${clientId}/mere`, mere);
  }

  deleteMere(clientId: number, mereId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${clientId}/mere/${mereId}`);
  }
}
