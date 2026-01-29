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
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users').then((m) => m.Users),
        title: 'Users - GYC Admin',
      },
      {
        path: 'announcements',
        loadComponent: () => import('./pages/notifications/notifications').then((m) => m.Notifications),
        title: 'Announcements - GYC Admin',
      },
      {
        path: 'blogs',
        loadComponent: () => import('./pages/blogs/blogs').then((m) => m.Blogs),
        title: 'Blogs - GYC Admin',
      },
      {
        path: 'blogs/new',
        loadComponent: () => import('./pages/blogs/new/new').then((m) => m.NewBlog),
        title: 'New Blog - GYC Admin',
      },
      {
        path: 'blogs/:id',
        loadComponent: () => import('./pages/blogs/edit/edit').then((m) => m.EditBlog),
        title: 'Edit Blog - GYC Admin',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((c) => c.NotFound),
    title: 'Page Not Found - GYC Admin',
  },
];
