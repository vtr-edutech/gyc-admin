import { Component, Input } from '@angular/core';
import { User } from '../../lib/types';
import { InfoTile } from "../info-tile/info-tile";
import { formatDates } from '../../lib/utils';

@Component({
  selector: 'app-user-details',
  imports: [InfoTile],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails {
  @Input() user: User | null = null;

  formatDate(date: Date | string) {
    return formatDates(date);
  }
}
