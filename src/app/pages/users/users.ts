import { Component, computed, inject } from '@angular/core';
import { Button } from "primeng/button";
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { UserService } from '../../services/user.service';
import { Skeleton } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { generateNumbers } from '../../lib/utils';
import { User } from '../../lib/types';
import { InfoTile } from "../../components/info-tile/info-tile";
import { UserDetails } from "../../components/user-details/user-details";
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-users',
  imports: [TableModule, Button, Skeleton, ToastModule, InfoTile, UserDetails, DialogModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  providers: [MessageService]
})
export class Users {
  usersService = inject(UserService);
  messageService = inject(MessageService);

  loadUsers(event: TableLazyLoadEvent): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.usersService.fetchUsers(page, limit, (error) => {
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
