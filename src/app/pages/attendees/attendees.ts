import { formatDates } from '@/app/lib/utils';
import { CourseCodeNamePipe } from '@/app/pipes/course-code-name.pipe';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { AttendeeService } from '@/app/services/attendee.service';
import { Component, inject } from '@angular/core';
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
  selector: 'app-attendees',
  imports: [
    TableModule,
    Skeleton,
    Button,
    TooltipModule,
    DatePicker,
    FormsModule,
    InputText,
    ConfirmPopup,
    CourseCodeNamePipe,
    FormatDatePipe,
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

  today = new Date();

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
