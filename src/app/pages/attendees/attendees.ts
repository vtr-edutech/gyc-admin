import { Component, inject } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AttendeeService } from '../../services/attendee.service';
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
  selector: 'app-attendees',
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
  templateUrl: './attendees.html',
  styleUrl: './attendees.css',
  providers: [ConfirmationService],
})
export class Attendees {
  messageService = inject(MessageService);
  attendeeService = inject(AttendeeService);
  confirmationService = inject(ConfirmationService);

  viewDateRange?: [Date?, Date?] = [];
  search = '';

  formatDate = formatDates;

  get totalRecords() {
    const data = this.attendeeService.attendees().data;
    if (!data || !data.totalDocsForFilter) return 0;
    return data.totalDocsForFilter === data.totalDocs ? data.totalDocs : data.totalDocsForFilter;
  }

  loadAttendees(event?: TableLazyLoadEvent): void {
    const page = (event?.first || 0) / (event?.rows || 10) + 1;
    const limit = event?.rows || 10;

    this.attendeeService.fetchAttendees(
      page,
      limit,
      {
        search: this.search,
        startDate: this.viewDateRange?.[0],
        endDate: this.viewDateRange?.[1],
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }

  download() {
    this.attendeeService.downloadAttendees((error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  confirmMarkAsAttended(event: Event, id: string) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to mark this as attended?',
      header: 'Mark as attended',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.markAsAttended(id);
      },
    });
  }

  markAsAttended(id: string) {
    this.attendeeService.markAsAttended(
      id,
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Marked as attended successfully',
        });
        this.loadAttendees();
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }
}
