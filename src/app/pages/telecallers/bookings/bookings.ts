import { Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import { Button } from 'primeng/button';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS } from '../../../lib/constants';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';
import Handsontable from 'handsontable';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-telecaller-bookings',
  imports: [Button, HotTableModule, ProgressSpinner, Paginator, FormsModule, InputText],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class TelecallerBookings implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);

  pagination = {
    first: 0,
    limit: 50,
  };

  searchKey = '';

  searchKeyChange() {
    if (this.searchKey === '')
      this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
    else this.searchRecords();
  }

  data = Array.from({ length: 50 }, (_, i) =>
    Array.from({ length: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS.length }, (_, j) => ''),
  );

  gridSettings: GridSettings = {
    stretchH: 'all',
    rowHeaders: ['1'],
    autoColumnSize: true,
    manualRowMove: false,
    manualColumnMove: false,
    manualColumnResize: true,
    headerClassName: 'font-semibold text-lg',
    columns: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS,
    hiddenColumns: {
      columns: [0],
      indicators: false,
    },
    filters: true,
    dropdownMenu: {
      items: ['filter_by_value', 'filter_action_bar'],
    },
    columnSorting: {
      headerAction: true,
      indicator: false,
      sortEmptyCells: false,
    },
    allowRemoveRow: false,
    allowRemoveColumn: false,
    beforeKeyDown: function (event) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        Handsontable.dom.stopImmediatePropagation(event);
      }
    },
  };

  hotColumnModifierWatch = effect(() => {
    if (this.telecallerBookingsService.telecallerBookings().data?.data) {
      const rows = this.telecallerBookingsService.telecallerBookings().data!.data!;
      this.hotTable.hotInstance?.updateData(rows);
    }
  });

  onPageChange(event: Paginator['paginatorState']) {
    this.pagination.first = event.first;
    this.pagination.limit = event.rows;
    this.telecallerBookingsService.fetchTelecallerBookings(event.page + 1, this.pagination.limit);
  }

  ngOnInit(): void {
    this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
  }

  handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.telecallerBookingsService.uploadTelecallerBookings(file);
    }
  }

  searchRecords() {
    this.telecallerBookingsService.fetchTelecallerBookings(
      1,
      this.pagination.limit,
      this.searchKey,
    );
  }
}
