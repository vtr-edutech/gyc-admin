import { Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import { Button } from 'primeng/button';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS } from '../../../lib/constants';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';

@Component({
  selector: 'app-telecaller-bookings',
  imports: [Button, HotTableModule, ProgressSpinner],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class TelecallerBookings implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);

  data = Array.from({ length: 50 }, (_, i) =>
    Array.from({ length: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.length }, (_, j) => ''),
  );

  colHeaders = TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.map((col) => col.columnName);

  gridSettings: GridSettings = {
    stretchH: 'all',
    colHeaders: this.colHeaders,
    columnHeaderHeight: 40,
    rowHeaders: ['1'],
    autoColumnSize: true,
    manualRowMove: true,
    manualColumnMove: true,
  };

  hotColumnModifierWatch = effect(() => {
    if (this.telecallerBookingsService.telecallerBookings().data?.data) {
      // Use the fixed column order from constants so indices are always stable.
      // _id is at index 0 — kept in data for future API update calls but hidden in the grid.
      const colHeaders = TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.map((col) => col.columnName);
      const hiddenColIndices = TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.map((col, i) =>
        col.isVisible === false ? i : -1,
      ).filter((i) => i !== -1);

      this.hotTable.hotInstance?.updateSettings({
        colHeaders,
        hiddenColumns: {
          columns: hiddenColIndices,
          indicators: false,
        },
        readOnly: true,
      });

      // Build each row as an array ordered by TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS,
      // so column indices always match regardless of the key order returned by the API.
      const rows = this.telecallerBookingsService
        .telecallerBookings()
        .data!.data!.map((booking) =>
          TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.map(
            (col) => (booking as unknown as Record<string, unknown>)[col.key] ?? null,
          ),
        );

      this.hotTable.hotInstance?.updateData(rows);
    }
  });

  ngOnInit(): void {
    this.telecallerBookingsService.fetchTelecallerBookings();
  }
}
