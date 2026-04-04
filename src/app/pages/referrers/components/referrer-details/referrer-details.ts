import { Component, inject, input, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { InfoTile } from '../../../../components/info-tile/info-tile';
import { formatDates } from '../../../../lib/utils';
import { ReferrersService } from '../../../../services/referrers.service';

@Component({
  selector: 'app-referrer-details',
  imports: [InfoTile, Skeleton, TableModule],
  templateUrl: './referrer-details.html',
  styleUrl: './referrer-details.css',
})
export class ReferrerDetails implements OnInit {
  referrerId = input.required<string>();
  referrersService = inject(ReferrersService);
  messageService = inject(MessageService);

  referrer = this.referrersService.referrerById;

  formatDates = formatDates;

  ngOnInit() {
    this.referrersService.fetchReferrerById(this.referrerId(), (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
      });
    });
  }
}
