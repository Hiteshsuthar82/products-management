import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders-list/orders-list').then(m => m.OrdersListComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./order-details/order-details').then(m => m.OrderDetailsComponent)
  }
];
