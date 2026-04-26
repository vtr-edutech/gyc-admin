import { Component, inject } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AttendeeService } from '../../services/attendee.service';
import { MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';

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
  ],
  templateUrl: './attendees.html',
  styleUrl: './attendees.css',
})
export class Attendees {
  messageService = inject(MessageService);
  attendeeService = inject(AttendeeService);

  viewDateRange?: [Date?, Date?] = [];
  search = '';

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
}
