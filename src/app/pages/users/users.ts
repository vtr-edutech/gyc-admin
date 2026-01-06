import { Component, inject, OnInit } from '@angular/core';
import { Button } from "primeng/button";
import { TableModule } from 'primeng/table';
import { UserService } from '../../services/user.service';
import { Skeleton } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-users',
  imports: [TableModule, Button, Skeleton, ToastModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  providers: [MessageService]
})
export class Users implements OnInit {
  usersService = inject(UserService);
  messageService = inject(MessageService);

  ngOnInit(): void {
    this.usersService.fetchUsers((error) => {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
    });
  }
}
