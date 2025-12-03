import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./categories-list/categories-list').then(m => m.CategoriesListComponent)
  },
  {
    path: 'add',
    loadComponent: () => import('./category-form/category-form').then(m => m.CategoryFormComponent)
  },
  {
    path: 'edit/:id',
    loadComponent: () => import('./category-form/category-form').then(m => m.CategoryFormComponent)
  }
];
