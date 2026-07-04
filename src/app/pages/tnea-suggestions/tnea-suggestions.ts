import { TneaSuggestionService } from '@/app/services/tnea-suggestions.service';
import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { FormsModule } from '@angular/forms';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { CourseCodeNamePipe } from '@/app/pipes/course-code-name.pipe';

@Component({
  selector: 'app-tnea-suggestions',
  imports: [
    Button,
    DatePicker,
    TableModule,
    Skeleton,
    FormsModule,
    FormatDatePipe,
    CourseCodeNamePipe,
  ],
  templateUrl: './tnea-suggestions.html',
  styleUrl: './tnea-suggestions.css',
})
export class TneaSuggestions {
  messageService = inject(MessageService);
  tneaSuggestionService = inject(TneaSuggestionService);
  viewDateRange?: [Date?, Date?] = [];
  search = '';

  today = new Date();
  get totalRecords() {
    const data = this.tneaSuggestionService.tneaSuggestions().data;
    if (!data || !data.totalDocsForFilter) return 0;
    return data.totalDocsForFilter === data.totalDocs ? data.totalDocs : data.totalDocsForFilter;
  }

  loadTneaSuggestions(event?: TableLazyLoadEvent): void {
    const page = (event?.first || 0) / (event?.rows || 10) + 1;
    const limit = event?.rows || 10;

    this.tneaSuggestionService.fetchTneaSuggestions(
      page,
      limit,
      {
        search: this.search,
        startDate: this.viewDateRange?.[0]?.toISOString(),
        endDate: this.viewDateRange?.[1]?.toISOString(),
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }

  download() {
    this.tneaSuggestionService.downloadTneaSuggestions((error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
