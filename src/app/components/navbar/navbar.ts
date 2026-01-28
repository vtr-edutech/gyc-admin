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

  userNameLabel = computed(() => {
    const fullName = this.authService.authState().data?.data?.name;
    if (!fullName) return "";
    return fullName.split(' ')[0]?.[0]?.toUpperCase() + "" + fullName.split(' ')[1]?.[0]?.toUpperCase();
  });

  logout() {
    this.authService.logout();
  }

  NAV_LINKS = [
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
    }
  ]
}
