import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { Component, computed, inject, OnInit } from '@angular/core';
import { HotCellRendererComponent } from '@handsontable/angular-wrapper';
import { MessageService } from 'primeng/api';
import { Badge } from 'primeng/badge';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-hot-view-button',
  imports: [Button, Badge],
  providers: [MessageService],
  templateUrl: './hot-view-button.html',
  styleUrl: './hot-view-button.css',
})
export class HotViewButton extends HotCellRendererComponent implements OnInit {
  telecallerBookingsService = inject(TelecallerBookingService);
  messageService = inject(MessageService);

  followUpCount = computed<number | null>(() => {
    const data = this.telecallerBookingsService.telecallerBookings().data;
    if (!data) return null;
    return data.data?.find((booking) => booking._id === this.value)?.followUps?.length ?? null;
  });

  followUpViewCallback?: Function;
  updateHistoryCallback?: Function;

  ngOnInit() {
    this.followUpViewCallback = this.getProps().onFollowUpViewClick;
    this.updateHistoryCallback = this.getProps().onUpdateHistoryViewClick;
  }

  onFollowUpClick(event: PointerEvent) {
    const bookingId = this.value;
    this.followUpViewCallback
      ? this.followUpViewCallback(bookingId)
      : this.messageService.add({ detail: 'No method implementation for follow up click' });
  }

  onUpdateHistoryClick(event: PointerEvent) {
    const bookingId = this.value;
    this.updateHistoryCallback
      ? this.updateHistoryCallback(bookingId)
      : this.messageService.add({ detail: 'No method implementation for update history click' });
  }
}
