import { InfoTile } from '@/app/components/info-tile/info-tile';
import { User } from '@/app/lib/types';
import { FormatDatePipe } from '@/app/pipes/format-date.pipe';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-user-details',
  imports: [InfoTile, FormatDatePipe],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails {
  @Input() user: User | null = null;

  // Setting this as a getter to avoid having to repeat the optional chaining and also direct variable assignment does NOT reflect changes to the user object
  get cutoff() {
    return this.user?.cutoff?.[0];
  }
}
