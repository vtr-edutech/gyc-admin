import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Skeleton } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { formatDates } from '../../lib/utils';
import { ReferrersService } from '../../services/referrers.service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-referrers',
  imports: [Toast, Button, Skeleton, TableModule, ConfirmPopup, Tooltip],
  templateUrl: './referrers.html',
  styleUrl: './referrers.css',
  providers: [ConfirmationService],
})
export class Referrers {
  referrersService = inject(ReferrersService);
  messageService = inject(MessageService);

  formatDates = formatDates;

  loadReferrers(event: TableLazyLoadEvent) {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;
    this.referrersService.fetchReferrers('', page, limit, (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
      });
    });
  }
}
