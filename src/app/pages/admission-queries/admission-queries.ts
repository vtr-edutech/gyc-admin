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
import { InputText } from 'primeng/inputtext';

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
  ],
  templateUrl: './admission-queries.html',
  styleUrl: './admission-queries.css',
})
export class AdmissionQueries {
  messageService = inject(MessageService);
  admissionQueryService = inject(AdmissionQueryService);

  downloadDateRange: [Date?, Date?] = [];
  viewDateRange: [Date?, Date?] = [];
  search: string = '';

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
}
