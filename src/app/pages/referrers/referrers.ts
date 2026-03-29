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
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { ReferrerDetails } from './referrer-details/referrer-details';

@Component({
  selector: 'app-referrers',
  imports: [
    Toast,
    Button,
    Skeleton,
    TableModule,
    ConfirmPopup,
    Tooltip,
    InputText,
    FormsModule,
    Dialog,
    ReferrerDetails,
  ],
  templateUrl: './referrers.html',
  styleUrl: './referrers.css',
  providers: [ConfirmationService],
})
export class Referrers {
  referrersService = inject(ReferrersService);
  messageService = inject(MessageService);

  searchKey = '';

  isReferrerDetailsModalOpen = false;
  selectedReferrer: string | null = null;

  formatDates = formatDates;

  isSearchActive(): boolean {
    return (
      this.referrersService.referrers().data?.totalDocsForFilter !==
      this.referrersService.referrers().data?.totalDocs
    );
  }

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

  search() {
    this.referrersService.fetchReferrers(this.searchKey, 1, 10, (error) => {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error,
      });
    });
  }

  toggleReferrerDetailsModal(referrerId: string | null) {
    this.selectedReferrer = referrerId;
    this.isReferrerDetailsModalOpen = !this.isReferrerDetailsModalOpen;
  }
}
