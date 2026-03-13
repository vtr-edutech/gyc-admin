import { NgClass } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { PasswordModule } from 'primeng/password';
import { Skeleton } from 'primeng/skeleton';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { TelecallerService } from '../../services/telecaller.service';
import { InputText } from 'primeng/inputtext';
import { AdminUser } from '../../lib/types';
import { RouterLink } from '@angular/router';

type TModalControls = {
  isTelecallerModalOpen: boolean;
  isEdit: boolean;
  selectedTelecaller: AdminUser<'telecaller'> | null;
};

@Component({
  selector: 'app-telecallers',
  imports: [
    TableModule,
    Skeleton,
    Dialog,
    Toast,
    FormsModule,
    NgClass,
    Button,
    PasswordModule,
    InputText,
    RouterLink,
  ],
  templateUrl: './telecallers.html',
  styleUrl: './telecallers.css',
})
export class Telecallers {
  messageService = inject(MessageService);
  telecallerService = inject(TelecallerService);
  modalControls: TModalControls = {
    isTelecallerModalOpen: false,
    isEdit: false,
    selectedTelecaller: null,
  };
  @ViewChild('telecallerForm') telecallerForm!: NgForm;

  loadTelecallers(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.telecallerService.fetchTelecallers(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  toggleTelecallerForm(
    toggle: boolean,
    mode: 'edit' | 'new',
    selectedTelecaller?: AdminUser<'telecaller'>,
  ) {
    this.modalControls.isTelecallerModalOpen = toggle;
    this.modalControls.isEdit = mode === 'edit';
    this.modalControls.selectedTelecaller = selectedTelecaller || null;
    if (mode === 'edit' && selectedTelecaller) {
      this.telecallerForm.setValue({
        _id: selectedTelecaller._id,
        name: selectedTelecaller.name,
        userName: selectedTelecaller.username,
        email: selectedTelecaller.email || '',
        mobile: selectedTelecaller.mobile || '',
        password: '',
        confirmPassword: '',
      });
    }
  }

  createTelecaller(form: NgForm) {
    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please check form for errors',
      });
      return;
    }

    this.telecallerService.createTelecaller(
      form.value,
      () => {
        this.modalControls.isTelecallerModalOpen = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Telecaller created successfully',
        });
        form.reset();
        form.resetForm();
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }

  updateTelecaller(form: NgForm) {
    if (form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please check form for errors',
      });
      return;
    }
    const selectedTelecallerId = this.modalControls.selectedTelecaller?._id;
    if (!selectedTelecallerId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No telecaller selected',
      });
      return;
    }
    this.telecallerService.updateTelecaller(
      selectedTelecallerId,
      form.value,
      () => {
        this.modalControls.isTelecallerModalOpen = false;
        this.modalControls.selectedTelecaller = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Telecaller updated successfully',
        });
        form.reset();
        form.resetForm();
      },
      (error) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
      },
    );
  }
}
