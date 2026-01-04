import { Component, computed, inject, OnInit } from '@angular/core';
import { Button } from "primeng/button";
import { TableModule } from 'primeng/table';
import { formatDates } from '../../lib/utils';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-users',
  imports: [TableModule, Button],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  usersService = inject(UserService);

  usersData = computed(() => {
    const rawData = this.usersService.users().data?.data || [];
    return rawData.map((user, i) => ({
      ...user,
      index: i + 1,
      createdAt: formatDates(user.createdAt),
      updatedAt: formatDates(user.updatedAt)
    }));
  });

  ngOnInit(): void {
    console.log(this.usersService.users());
  }
}
