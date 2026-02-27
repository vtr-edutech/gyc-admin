import { Component, inject } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Skeleton } from "primeng/skeleton";
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { TelecallerService } from '../../services/telecaller.service';

@Component({
  selector: 'app-telecallers',
  imports: [TableModule, Skeleton],
  templateUrl: './telecallers.html',
  styleUrl: './telecallers.css',
})
export class Telecallers {
  messageService = inject(MessageService);
  telecallerService = inject(TelecallerService);

  loadTelecallers(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.telecallerService.fetchTelecaller(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
