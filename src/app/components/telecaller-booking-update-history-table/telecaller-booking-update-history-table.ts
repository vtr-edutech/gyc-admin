import { TELECALLER_BOOKINGS_COLUMN_NAME_MAP } from '@/app/lib/constants';
import { TelecallerBookingHistoryFetchResponse } from '@/app/lib/types';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { Avatar } from 'primeng/avatar';
import { generateInitials } from '@/app/lib/utils';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-telecaller-booking-update-history-table',
  imports: [FormatDatePipe, Skeleton, Avatar],
  providers: [MessageService],
  templateUrl: './telecaller-booking-update-history-table.html',
  styleUrl: './telecaller-booking-update-history-table.css',
})
export class TelecallerBookingUpdateHistoryTable {
  bookingId = input.required<string | null>();

  telecallerBookingsService = inject(TelecallerBookingService);
  messageService = inject(MessageService);

  currentBookingUpdateHistory = signal<TelecallerBookingHistoryFetchResponse[] | null>(null);

  constructor() {
    effect(() => {
      const bookingId = this.bookingId();
      if (!bookingId) return;
      const bookingUpdateHistory = this.telecallerBookingsService.telecallerBookingHistory();
      if (bookingUpdateHistory.isLoading || bookingUpdateHistory.error) return;
      const updateHistoryForId = bookingUpdateHistory.data?.[bookingId];
      if (updateHistoryForId) {
        this.currentBookingUpdateHistory.set(updateHistoryForId);
      } else {
        this.telecallerBookingsService.fetchTelecallerBookingsHistory(
          bookingId,
          undefined,
          (err) => {
            this.messageService.add({
              detail: err,
              summary: 'Error',
              severity: 'error',
            });
          },
        );
      }
    });
  }

  getReadableColumnName = (fieldName: string) =>
    TELECALLER_BOOKINGS_COLUMN_NAME_MAP[
      fieldName as keyof typeof TELECALLER_BOOKINGS_COLUMN_NAME_MAP
    ];

  generateInitials = generateInitials;
}
