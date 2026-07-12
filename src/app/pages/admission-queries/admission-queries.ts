import { InfoTile } from '@/app/components/info-tile/info-tile';
import { formatDates, isObjectEntriesEmpty } from '@/app/lib/utils';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { AdmissionQueryService } from '@/app/services/admission-query.service';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-admission-queries',
  imports: [
    TableModule,
    Skeleton,
    Button,
    TooltipModule,
    DatePicker,
    FormsModule,
    InputText,
    ConfirmPopup,
    FormatDatePipe,
    InfoTile,
  ],
  templateUrl: './admission-queries.html',
  styleUrl: './admission-queries.css',
  providers: [ConfirmationService],
})
export class AdmissionQueries {
  messageService = inject(MessageService);
  admissionQueryService = inject(AdmissionQueryService);
  confirmationService = inject(ConfirmationService);

  admissionQueriesData = computed(() => this.admissionQueryService.admissionQueries().data);
  isAdmissionQueriesLoading = computed(
    () => this.admissionQueryService.admissionQueries().isLoading,
  );

  downloadDateRange: [Date?, Date?] = [];
  viewDateRange: [Date?, Date?] = [];
  search: string = '';

  formatDate = formatDates;
  isObjectEmpty = isObjectEntriesEmpty;

  get totalRecords() {
    const data = this.admissionQueryService.admissionQueries().data;
    if (!data || !data.totalDocsForFilter) return 0;
    return data.totalDocsForFilter === data.totalDocs ? data.totalDocs : data.totalDocsForFilter;
  }

  loadAdmissionQueries(event?: TableLazyLoadEvent): void {
    const page = event ? (event.first || 0) / (event.rows || 10) + 1 : 1;
    const limit = event ? event.rows || 10 : 10;

    this.admissionQueryService.fetchAdmissionQueries(
      page,
      limit,
      this.search,
      this.viewDateRange,
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }

  download() {
    this.admissionQueryService.downloadAdmissionQueries(this.downloadDateRange, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  confirmMarkAsAttended(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to mark this admission query as attended?',
      header: 'Mark as attended',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.markAsAttended(id);
      },
    });
  }

  markAsAttended(id: string) {
    this.admissionQueryService.markAttendanceAdmissionQuery(
      id,
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Admission query marked as attended',
        });
        this.loadAdmissionQueries();
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }
}
