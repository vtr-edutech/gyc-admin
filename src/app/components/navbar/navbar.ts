import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AuthService } from '@/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Ripple, RouterLinkActive, Button, Avatar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);

  isSidebarClosed = input<boolean>();
  onToggleSidebar = output<boolean>();

  readonly userRole = computed(() => this.authService.authState().data?.data?.role);

  logout() {
    this.authService.logout();
  }

  readonly NAV_LINKS = [
    {
      label: 'Home',
      path: '/home',
      icon: 'pi pi-home',
      accessRoles: ['admin', 'superadmin', 'telecaller'],
    },
    {
      label: 'Users',
      path: '/users',
      icon: 'pi pi-users',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Attendees',
      path: '/attendees',
      icon: 'pi pi-users',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Admission Queries',
      path: '/admission-queries',
      icon: 'pi pi-question-circle',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'TNEA Suggestions',
      path: '/tnea-suggestions',
      icon: 'pi pi-list-check',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Referrers',
      path: '/referrers',
      icon: 'pi pi-user-plus',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Reviews',
      path: '/reviews',
      icon: 'pi pi-comments',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Announcements',
      path: '/announcements',
      icon: 'pi pi-bell',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Blogs',
      path: '/blogs',
      icon: 'pi pi-book',
      accessRoles: ['admin', 'superadmin'],
    },
    {
      label: 'Bookings',
      path: '/bookings',
      icon: 'pi pi-calendar',
      accessRoles: ['admin', 'superadmin', 'telecaller'],
    },
    {
      label: 'Telecaller',
      path: '/telecallers',
      icon: 'pi pi-user',
      accessRoles: ['admin', 'superadmin'],
    },
  ];

  roleFilteredNavLinks = computed(() => {
    const role = this.userRole();
    if (!role) return [];
    return this.NAV_LINKS.filter((link) => link.accessRoles.includes(role));
  });

  handleSidebarToggle(open: boolean) {
    this.onToggleSidebar.emit(open);
  }
}
