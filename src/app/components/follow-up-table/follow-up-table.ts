import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { Component, computed, inject, input } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { Chip } from 'primeng/chip';

@Component({
  selector: 'app-follow-up-table',
  imports: [TableModule, Tooltip, FormatDatePipe, Chip],
  templateUrl: './follow-up-table.html',
  styleUrl: './follow-up-table.css',
})
export class FollowUpTable {
  bookingId = input.required<string | null>();

  telecallerBookingsService = inject(TelecallerBookingService);

  currentAssignment = computed(() => {
    if (!this.bookingId) return null;
    return this.telecallerBookingsService
      .telecallerBookings()
      .data?.data?.find((b) => b._id === this.bookingId());
  });

  followUps = computed(
    () => this.currentAssignment()?.followUps?.map((f, i) => ({ ...f, index: i + 1 })) ?? [],
  );
}
