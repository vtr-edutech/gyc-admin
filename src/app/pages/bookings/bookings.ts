import { Component, inject } from '@angular/core';
import { Button } from "primeng/button";
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Skeleton } from "primeng/skeleton";
import { ConfirmPopup } from "primeng/confirmpopup";
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
import { SlotBookingService } from '../../services/slot-booking.service';

@Component({
  selector: 'app-bookings',
  imports: [Button, TableModule, Skeleton, ConfirmPopup],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
  providers: [ConfirmationService]
})
export class Bookings {
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  slotBookingService = inject(SlotBookingService);

  loadBookings(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.slotBookingService.fetchSlotBookings(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  confirmMarkAsAttended(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.currentTarget as EventTarget,
      message: 'Do you want to mark this booking as attended?',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true
      },
      acceptButtonProps: {
        label: 'Mark as attended',
        severity: 'success'
      },
      accept: () => {
        this.markAsAttended(id);
      },
      reject: () => {
      }
    });
  }

  markAsAttended(id: string) {
    this.slotBookingService.updateSlotBooking(id, () => {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Booking marked as attended successfully' });
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
