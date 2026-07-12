import { InfoTile } from '@/app/components/info-tile/info-tile';
import { copyTextToClipboard, formatDates, isObjectEntriesEmpty } from '@/app/lib/utils';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { ReferrersService } from '@/app/services/referrers.service';
import { Component, computed, effect, inject, signal } from '@angular/core';
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
    InfoTile,
  ],
  templateUrl: './referrers.html',
  styleUrl: './referrers.css',
  providers: [ConfirmationService],
})
export class Referrers {
  referrersService = inject(ReferrersService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  referrersData = computed(() => this.referrersService.referrers().data);
  isReferrersLoading = computed(() => this.referrersService.referrers().isLoading);

  searchKey = '';
  tooltipIcon = signal('pi pi-copy');

  isReferrerDetailsModalOpen = false;
  selectedReferrer: string | null = null;

  formatDates = formatDates;
  copyToClipboard = async (text: string) => {
    this.tooltipIcon.set('pi pi-check');
    await copyTextToClipboard(text);
  };
  isObjectEmpty = isObjectEntriesEmpty;

  constructor() {
    effect((onCleanup) => {
      let iconChangeTimeout = null;
      if (this.tooltipIcon() === 'pi pi-check' && !iconChangeTimeout) {
        iconChangeTimeout = setTimeout(() => this.tooltipIcon.set('pi pi-copy'), 1000);
      }

      onCleanup(() => {
        if (iconChangeTimeout) clearTimeout(iconChangeTimeout);
      });
    });
  }

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
    const referrer = this.referrersData()?.data?.find((ref) => ref._id === referrerId);
    const referrerDetail = referrer ? `${referrer?.name} (${referrer?.email})` : 'this referrer';
    const message = `Are you sure you want to ${isDeactivate ? 'deactivate' : 'activate'} ${referrerDetail}?`;
    this.confirmationService.confirm({
      target: event.target || undefined,
      message,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: {
        label: 'Deactivate',
        severity: isDeactivate ? 'danger' : 'success',
      },
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
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
