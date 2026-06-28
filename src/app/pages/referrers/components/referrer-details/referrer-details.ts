import { InfoTile } from '@/app/components/info-tile/info-tile';
import { formatDates } from '@/app/lib/utils';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { ReferrersService } from '@/app/services/referrers.service';
import { Component, inject, input, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-referrer-details',
  imports: [InfoTile, Skeleton, TableModule, FormatDatePipe],
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
