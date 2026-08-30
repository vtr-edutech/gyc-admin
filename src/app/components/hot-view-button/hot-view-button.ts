import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { Component, computed, inject } from '@angular/core';
import { HotCellRendererComponent } from '@handsontable/angular-wrapper';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-hot-view-button',
  imports: [Button, Badge],
  templateUrl: './hot-view-button.html',
  styleUrl: './hot-view-button.css',
})
export class HotViewButton extends HotCellRendererComponent {
  telecallerBookingsService = inject(TelecallerBookingService);

  followUpCount = computed<number | null>(() => {
    const data = this.telecallerBookingsService.telecallerBookings().data;
    if (!data) return null;
    return data.data?.find((booking) => booking._id === this.value)?.followUps?.length ?? null;
  });

  onClick(event: PointerEvent) {
    const bookingId = this.value;
    const props = this.getProps();
    props.action(bookingId);
  }
}
