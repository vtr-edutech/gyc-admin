import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import { Button } from 'primeng/button';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS } from '../../../lib/constants';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';

@Component({
  selector: 'app-telecaller-bookings',
  imports: [Button, HotTableModule, ProgressSpinner, Paginator],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class TelecallerBookings implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);

  first = 0;
  limit = 50;

  data = Array.from({ length: 50 }, (_, i) =>
    Array.from({ length: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.length }, (_, j) => ''),
  );

  gridSettings: GridSettings = {
    stretchH: 'all',
    rowHeaders: ['1'],
    autoColumnSize: true,
    manualRowMove: true,
    manualColumnMove: true,
    headerClassName: 'font-semibold text-lg',
    columns: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS,
    hiddenColumns: {
      columns: [0],
      indicators: false,
    },
  };

  hotColumnModifierWatch = effect(() => {
    if (this.telecallerBookingsService.telecallerBookings().data?.data) {
      const rows = this.telecallerBookingsService.telecallerBookings().data!.data!;
      this.hotTable.hotInstance?.updateData(rows);
    }
  });

  onPageChange(event: Paginator['paginatorState']) {
    this.first = event.first;
    this.limit = event.rows;
    this.telecallerBookingsService.fetchTelecallerBookings(event.page + 1, this.limit);
  }

  ngOnInit(): void {
    this.telecallerBookingsService.fetchTelecallerBookings(1, this.limit);
  }
}
