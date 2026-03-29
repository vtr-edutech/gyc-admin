import { Component, inject, input, OnInit } from '@angular/core';
import { ReferrersService } from '../../../services/referrers.service';
import { MessageService } from 'primeng/api';
import { InfoTile } from '../../../components/info-tile/info-tile';
import { Skeleton } from 'primeng/skeleton';
import { formatDates } from '../../../lib/utils';
import { TableModule } from 'primeng/table';

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
