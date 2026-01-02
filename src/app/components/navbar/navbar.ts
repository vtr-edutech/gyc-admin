import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from "@angular/router";
import { Ripple } from "primeng/ripple";

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, Ripple, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
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
  ]
}
