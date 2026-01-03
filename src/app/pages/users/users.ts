import { Component } from '@angular/core';
import { Button } from "primeng/button";
import { TableModule } from 'primeng/table';
import { formatDates } from '../../lib/utils';

@Component({
  selector: 'app-users',
  imports: [TableModule, Button],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {


  usersResponse = {
    "data": [{
      "_id": "677611124242424242424242",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "mobile": "1234567890",
      "district": "District 1",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }],
    "page": 1,
    "totalPages": 538,
    "totalDocs": 13436
  }

  usersData = this.usersResponse.data.map((user, i) => ({ ...user, index: i + 1, createdAt: formatDates(user.createdAt), updatedAt: formatDates(user.updatedAt) }));
}
