import { Component, inject } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AttendeeService } from '../../services/attendee.service';
import { MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-attendees',
  imports: [TableModule, Skeleton, DatePipe],
  templateUrl: './attendees.html',
  styleUrl: './attendees.css',
})
export class Attendees {
  messageService = inject(MessageService);
  attendeeService = inject(AttendeeService);

  loadAttendees(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.attendeeService.fetchAttendees(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
