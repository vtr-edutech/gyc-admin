import { formatDates } from '@/app/lib/utils';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { ReferrersService } from '@/app/services/referrers.service';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { ReferrerDetails } from './components/referrer-details/referrer-details';

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
    FormatDatePipe,
  ],
  templateUrl: './referrers.html',
  styleUrl: './referrers.css',
  providers: [ConfirmationService],
})
export class Referrers {
  referrersService = inject(ReferrersService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

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

  showActivationPopup(event: Event, referrerId: string, isDeactivate: boolean) {
    const message = isDeactivate
      ? 'Are you sure you want to deactivate this referrer?'
      : 'Are you sure you want to activate this referrer?';
    this.confirmationService.confirm({
      target: event.target || undefined,
      message,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.referrersService.toggleActivation(
          referrerId,
          (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response?.message,
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: error,
            });
          },
        );
      },
    });
  }
}
