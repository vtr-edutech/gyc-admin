import { Component, inject } from '@angular/core';
import { Button } from "primeng/button";
import { TableModule } from 'primeng/table';
import { UserService } from '../../services/user.service';
import { Skeleton } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { generateNumbers } from '../../lib/utils';

@Component({
  selector: 'app-users',
  imports: [TableModule, Button, Skeleton, ToastModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  providers: [MessageService]
})
export class Users {
  usersService = inject(UserService);
  messageService = inject(MessageService);

  loadUsers(event: any): void {
    const page = (event.first || 0) / (event.rows || 10) + 1;
    const limit = event.rows || 10;

    this.usersService.fetchUsers(page, limit, (error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
