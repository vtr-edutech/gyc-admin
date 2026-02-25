import { Component, computed, inject } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { AuthService } from '../../services/auth.service';
import { AdminBookings } from "./admin/admin";
import { TelecallerBooking } from "./telecaller/telecaller";

@Component({
  selector: 'app-bookings',
  imports: [AdminBookings, TelecallerBooking],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
  providers: [ConfirmationService]
})
export class Bookings {
  authService = inject(AuthService);
  userRole = computed(() => this.authService.authState().data?.data?.role);
}
