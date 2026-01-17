import { Component, inject } from '@angular/core';
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Skeleton } from "primeng/skeleton";
import { AnnouncementsService } from '../../services/announcements.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-notifications',
  imports: [TableModule, Skeleton],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications {
  announcementsService = inject(AnnouncementsService);
  messageService = inject(MessageService);

  loadAnnouncements(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.announcementsService.fetchAnnouncements(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
