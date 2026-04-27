import { Component, inject } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AdmissionQueryService } from '../../services/admission-query.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { formatDates } from '../../lib/utils';

@Component({
  selector: 'app-admission-queries',
  imports: [
    TableModule,
    Skeleton,
    DatePipe,
    Button,
    TooltipModule,
    DatePicker,
    FormsModule,
    InputText,
    ConfirmPopup,
  ],
  templateUrl: './admission-queries.html',
  styleUrl: './admission-queries.css',
  providers: [ConfirmationService],
})
export class AdmissionQueries {
  messageService = inject(MessageService);
  admissionQueryService = inject(AdmissionQueryService);
  confirmationService = inject(ConfirmationService);

  downloadDateRange: [Date?, Date?] = [];
  viewDateRange: [Date?, Date?] = [];
  search: string = '';

  formatDate = formatDates;

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
