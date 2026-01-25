import { Component, computed, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { UserService } from '../../services/user.service';
import { Skeleton } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { generateNumbers } from '../../lib/utils';
import { User } from '../../lib/types';
import { InfoTile } from "../../components/info-tile/info-tile";
import { UserDetails } from "../../components/user-details/user-details";
import { DialogModule } from 'primeng/dialog';
import { InputText } from "primeng/inputtext";
import { DatePicker } from "primeng/datepicker";

@Component({
  selector: 'app-users',
  imports: [TableModule, Button, Skeleton, ToastModule, InfoTile, UserDetails, DialogModule, InputText, DatePicker, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  providers: [MessageService]
})
export class Users {
  usersService = inject(UserService);
  messageService = inject(MessageService);

  @ViewChild('dt') dt!: Table;

  searchModel = {
    name: '',
    email: '',
    mobile: '',
    date: null
  };

  downloadModel = [];

  loadUsers(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.usersService.fetchUsers(page, limit, this.searchModel, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  search(): void {
    this.dt.reset();
  }

  isSearchActive(): boolean {
    return this.usersService.users().data?.totalDocsForFilter !== this.usersService.users().data?.totalDocs;
  }

  download(): void {
    if (this.downloadModel.length !== 2) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please select a date range' });
      return;
    }
    this.usersService.downloadUsers(this.downloadModel, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }

  isUserDetailsModalOpen = false;
  selectedUser: User | null = null;

  toggleUserDetailsModal(user: User | null): void {
    this.selectedUser = user;
    this.isUserDetailsModalOpen = !this.isUserDetailsModalOpen;
  }
}
