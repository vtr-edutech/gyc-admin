import { Component, Input } from '@angular/core';
import { Skeleton } from "primeng/skeleton";

@Component({
  selector: 'app-info-tile',
  imports: [Skeleton],
  templateUrl: './info-tile.html',
  styleUrl: './info-tile.css',
})
export class InfoTile {
  @Input({ required: true }) title: string = '';
  @Input() value: string | number | undefined = undefined;
  @Input() noDataMessage: string = 'No Data';
  @Input() isLoading: boolean = false;
}
