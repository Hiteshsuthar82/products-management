import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { AdminGuard } from './shared/guards/admin.guard';
import { CountryConfigComponent } from './components/countryConfig/config.component';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./components/auth/login/login').then(m => m.LoginComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    loadComponent: () => import('./components/layout/admin-layout/admin-layout').then(m => m.AdminLayoutComponent),
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      {
        path: 'country-config',
        loadComponent: () => import('./components/countryConfig/config.component').then(m => m.CountryConfigComponent)
      },
      {
        path: 'products',
        loadChildren: () => import('./components/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'categories',
        loadChildren: () => import('./components/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
      },
      {
        path: 'orders',
        loadChildren: () => import('./components/orders/orders.routes').then(m => m.ORDERS_ROUTES)
      },
      {
        path: 'users',
        loadChildren: () => import('./components/users/users.routes').then(m => m.USERS_ROUTES)
      },
      {
        path: 'redeem',
        loadChildren: () => import('./components/redeem/redeem.routes').then(m => m.REDEEM_ROUTES)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];