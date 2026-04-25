import { Component, inject } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { AdmissionQueryService } from '../../services/admission-query.service';
import { MessageService } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';
import { DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DatePicker } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admission-queries',
  imports: [TableModule, Skeleton, DatePipe, Button, TooltipModule, DatePicker, FormsModule],
  templateUrl: './admission-queries.html',
  styleUrl: './admission-queries.css',
})
export class AdmissionQueries {
  messageService = inject(MessageService);
  admissionQueryService = inject(AdmissionQueryService);

  dateRange: [Date?, Date?] = [];

  loadAdmissionQueries(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.admissionQueryService.fetchAdmissionQueries(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  download() {
    this.admissionQueryService.downloadAdmissionQueries(this.dateRange, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
