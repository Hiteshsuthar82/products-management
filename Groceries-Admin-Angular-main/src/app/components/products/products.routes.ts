import { Routes } from '@angular/router';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./products-list/products-list').then(m => m.ProductsListComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./product-form/product-form').then(m => m.ProductFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./product-form/product-form').then(m => m.ProductFormComponent)
  }
];
