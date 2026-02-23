import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Ripple } from "primeng/ripple";
import { Button, ButtonIcon } from "primeng/button";
import { Avatar } from "primeng/avatar";
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Ripple, RouterLinkActive, Button, Avatar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }

  readonly NAV_LINKS = [
    {
      label: 'Home',
      path: '/home',
      icon: "pi pi-home"
    },
    {
      label: 'Users',
      path: '/users',
      icon: "pi pi-users"
    },
    {
      label: 'Announcements',
      path: '/announcements',
      icon: "pi pi-bell"
    },
    {
      label: 'Blogs',
      path: '/blogs',
      icon: "pi pi-book"
    },
    {
      label: 'Bookings',
      path: '/bookings',
      icon: "pi pi-calendar"
    },
  ]
}
