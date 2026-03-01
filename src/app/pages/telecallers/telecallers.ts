import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from "primeng/button";
import { Dialog } from "primeng/dialog";
import { InputText } from "primeng/inputtext";
import { Skeleton } from "primeng/skeleton";
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Toast } from "primeng/toast";
import { TelecallerService } from '../../services/telecaller.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-telecallers',
  imports: [TableModule, Skeleton, Dialog, Toast, FormsModule, NgClass, Button, InputText],
  templateUrl: './telecallers.html',
  styleUrl: './telecallers.css',
})
export class Telecallers {
  messageService = inject(MessageService);
  telecallerService = inject(TelecallerService);
  isTelecallerModalOpen = false;
  isEdit = false;

  loadTelecallers(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.telecallerService.fetchTelecaller(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  openTelecallerForm(mode: "edit" | "new") {
    this.isTelecallerModalOpen = true;
    this.isEdit = mode === "edit";
  }

  createTelecaller(form: NgForm) {
    if (form.invalid) return;

    this.telecallerService.createTelecaller(form.value, () => {
      this.isTelecallerModalOpen = false;
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Telecaller created successfully' });
      form.reset();
      form.resetForm();
    }, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  updateTelecaller(form: NgForm) {

  }
}
