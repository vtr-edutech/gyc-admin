import { AfterViewInit, Component, effect, inject, OnInit, ViewChild } from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
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
export class TelecallerBookings implements OnInit, AfterViewInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);

  data = Array.from({ length: 50 }, (_, i) =>
    Array.from({ length: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.length }, (_, j) => ''),
  );

  colHeaders = TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.map((col) => col.columnName);

  gridSettings: GridSettings = {
    stretchH: 'all',
    colHeaders: this.colHeaders,
    rowHeaders: ['1'],
    autoColumnSize: true,
    manualRowMove: true,
    manualColumnMove: true,
    headerClassName: 'font-semibold text-lg',
    columns: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.map((col) => {
      if (col.key === 'dataValidationStatus') {
        return {
          renderer: (
            hot: Handsontable,
            TD: HTMLTableCellElement,
            row: number,
            column: number,
            prop: string | number,
            value: string,
            cellProperties: Handsontable.CellProperties,
          ) => {
            Handsontable.renderers.TextRenderer(hot, TD, row, column, prop, value, cellProperties);
            // Reset any previously applied status classes before re-applying.
            TD.classList.remove(
              'bg-green-200',
              '!text-green-900',
              'bg-red-200',
              '!text-red-900',
              'bg-amber-200',
              '!text-amber-900',
            );
            if (value === 'correct') TD.classList.add('!bg-green-200', '!text-green-700');
            if (value === 'incorrect') TD.classList.add('!bg-red-200', '!text-red-700');
            if (value === 'partial') TD.classList.add('!bg-amber-200', '!text-amber-700');
          },
        };
      }
      return {};
    }),
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

  ngAfterViewInit(): void {
    // this.hotTable.hotInstance?.addHook("aftercell")
  }
}
