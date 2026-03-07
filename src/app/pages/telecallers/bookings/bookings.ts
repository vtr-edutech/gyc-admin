import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import { Button } from 'primeng/button';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';

@Component({
  selector: 'app-telecaller-bookings',
  imports: [Button, HotTableModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class TelecallerBookings implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);

  data = [
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
  ];

  colHeaders = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  rowHeaders = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  gridSettings: GridSettings = {
    stretchH: 'all',
    colHeaders: this.colHeaders,
    rowHeaders: this.rowHeaders,
  };

  ngOnInit(): void {
    this.telecallerBookingsService.fetchTelecallerBookings();
  }
}
