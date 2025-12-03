import { Routes } from '@angular/router';

export const REDEEM_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./redeem-list/redeem-list').then(m => m.RedeemListComponent)
  }
];
