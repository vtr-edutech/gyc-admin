import { Routes } from '@angular/router';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/sign-in/sign-in').then((m) => m.SignIn),
    title: 'Sign In - GYC Admin',
  },
  {
    path: '',
    component: Layout,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
        title: 'Home - GYC Admin',
      },
    ],
  },
];
