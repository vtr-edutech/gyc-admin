import { Component, computed, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { HomeAdmin } from './admin/admin';
import { HomeTelecaller } from "./telecaller/telecaller";

@Component({
  selector: 'app-home',
  imports: [HomeAdmin, HomeTelecaller],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  authService = inject(AuthService);
  userRole = computed(() => this.authService.authState().data?.data?.role);
}
