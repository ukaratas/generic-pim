import { Routes } from '@angular/router';
import { ProductsPage } from './features/products/products-page/products-page';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  { path: 'products', component: ProductsPage },
  { path: 'types', loadComponent: () => import('./features/product-types/types-page/types-page').then(m => m.TypesPage) },
  { path: 'types/:id/properties', loadComponent: () => import('./features/product-types/type-properties-page/type-properties-page').then(m => m.TypePropertiesPage) }
];
