import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent), canActivate: [loginGuard] },
  { path: 'klijenti', loadComponent: () => import('./components/client-list/client-list.component').then(m => m.ClientListComponent), canActivate: [authGuard] },
  { path: 'narudzbine', loadComponent: () => import('./components/order-list/order-list.component').then(m => m.OrderListComponent), canActivate: [authGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
