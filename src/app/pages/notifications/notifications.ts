import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableLazyLoadEvent, TableModule } from "primeng/table";
import { Skeleton } from "primeng/skeleton";
import { AnnouncementsService } from '../../services/announcements.service';
import { MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { Toast } from "primeng/toast";
import { Dialog } from "primeng/dialog";
import { Select } from "primeng/select";
import { InputText } from "primeng/inputtext";
import { Textarea } from "primeng/textarea";
import { DatePicker } from "primeng/datepicker";
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, TableModule, Skeleton, Button, Toast, Dialog, Select, InputText, Textarea, DatePicker, FormsModule],
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

  announcementTypes = [
    { label: 'Engineering', value: 'engg' },
    { label: 'Medical', value: 'medical' },
    { label: 'JoSAA', value: 'josaa' }
  ];

  isCreateAnnouncementModalOpen = false;

  createAnnouncement(form: NgForm): void {
    if (form.invalid) return;

    const { startDate, endDate, ...rest } = form.value;

    const payload = {
      ...rest,
      startDate: startDate ? new Date(startDate).toISOString() : undefined,
      endDate: endDate ? new Date(endDate).toISOString() : undefined
    };

    this.announcementsService.createAnnouncement(payload, () => {
      this.isCreateAnnouncementModalOpen = false;
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Announcement created successfully' });
      form.reset();
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
