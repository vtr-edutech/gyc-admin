import { InfoTile } from '@/app/components/info-tile/info-tile';
import { UserDetails } from '@/app/components/user-details/user-details';
import { User } from '@/app/lib/types';
import { isObjectEntriesEmpty } from '@/app/lib/utils';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { SearchFilters, UserService } from '@/app/services/user.service';
import { Component, computed, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Skeleton } from 'primeng/skeleton';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-users',
  imports: [
    TableModule,
    Button,
    Skeleton,
    ToastModule,
    InfoTile,
    UserDetails,
    DialogModule,
    InputText,
    DatePicker,
    FormsModule,
    FormatDatePipe,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
  providers: [MessageService],
})
export class Users {
  usersService = inject(UserService);
  messageService = inject(MessageService);

  userServiceData = computed(() => this.usersService.users().data);
  isUsersLoading = computed(() => this.usersService.users().isLoading);

  @ViewChild('dt') dt!: Table;

  searchModel: SearchFilters = {
    name: '',
    email: '',
    mobile: '',
    date: null,
  };

  isObjectEmpty = isObjectEntriesEmpty;

  downloadModel = [];
  today = new Date();

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
    return (
      this.usersService.users().data?.totalDocsForFilter !==
      this.usersService.users().data?.totalDocs
    );
  }

  download(): void {
    if (this.downloadModel.length !== 2) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a date range',
      });
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
