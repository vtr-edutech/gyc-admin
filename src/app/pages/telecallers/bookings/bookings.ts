import { Component, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MultiSelect } from 'primeng/multiselect';
import { Toast } from 'primeng/toast';
import { TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS } from '../../../lib/constants';
import { TelecallerAssignmentUpdate } from '../../../lib/types';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';
import { TelecallerService } from '../../../services/telecaller.service';

@Component({
  selector: 'app-telecaller-bookings',
  imports: [
    Button,
    HotTableModule,
    ProgressSpinner,
    Paginator,
    FormsModule,
    InputText,
    Toast,
    MultiSelect,
    FloatLabelModule,
  ],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
  providers: [MessageService],
})
export class TelecallerBookings implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);
  telecallerService = inject(TelecallerService);
  messageService = inject(MessageService);

  pagination = {
    first: 0,
    limit: 50,
  };

  searchKey = '';

  hotMeta = {
    areHotHooksAdded: false,
    selectedRows: signal<number[]>([]),
  };

  rowUpdates = signal<TelecallerAssignmentUpdate[]>([]);

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
    renderAllColumns: true,
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

  hotModifierWatch = effect(() => {
    const bookingsData = this.telecallerBookingsService.telecallerBookings().data?.data;
    if (!bookingsData) return;
    // Update HoT table with data
    const rows = bookingsData;
    this.hotTable.hotInstance?.updateData(rows);

    const handleSelectRows = (changes: Handsontable.CellChange[]) => {
      changes.forEach((change) => {
        const [rowIndex, , , newValue] = change;
        if (newValue === true) {
          this.hotMeta.selectedRows.update((rows) => [...rows, rowIndex]);
        } else {
          this.hotMeta.selectedRows.update((rows) => rows.filter((row) => row !== rowIndex));
        }
      });
    };

    // Register afterChange callback func to track row edits
    const afterChangeCallback: Handsontable.GridSettings['afterChange'] = (changes, source) => {
      console.log(changes);

      const validChangeSources: Handsontable.ChangeSource[] = [
        'UndoRedo.redo',
        'UndoRedo.undo',
        'edit',
      ];
      if (!validChangeSources.includes(source) || !changes) return;

      // check select column change
      if (changes.every((change) => change[1] === 'select')) {
        handleSelectRows(changes);
        return;
      }

      changes.forEach((change) => {
        const [rowIndex, fieldName, , newValue] = change;

        if (typeof fieldName !== 'string' || !(fieldName in bookingsData[rowIndex])) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Something went wrong in capturing update for Row ${rowIndex + 1}, Column ${fieldName}`,
          });
          return;
        }

        // Update existing update object if same id is edited
        const existingUpdate = this.rowUpdates().find(
          (update) => update._id === bookingsData[rowIndex]._id,
        );
        if (existingUpdate) {
          existingUpdate[fieldName as keyof TelecallerAssignmentUpdate] = newValue;
          const updatedUpdates = this.rowUpdates().map((update) => {
            if (update._id === bookingsData[rowIndex]._id) {
              return existingUpdate;
            }
            return update;
          });
          this.rowUpdates.set(updatedUpdates);
          console.log('updated row updates:', updatedUpdates);
          return;
        }

        this.rowUpdates.update((updates) => [
          ...updates,
          {
            _id: bookingsData[rowIndex]._id,
            [fieldName]: newValue,
          },
        ]);
      });
    };

    if (!this.hotMeta.areHotHooksAdded) {
      this.hotTable.hotInstance?.addHook('afterChange', afterChangeCallback);
      this.hotMeta.areHotHooksAdded = true;
    }
  });

  onPageChange(event: Paginator['paginatorState']) {
    this.pagination.first = event.first;
    this.pagination.limit = event.rows;
    this.telecallerBookingsService.fetchTelecallerBookings(
      event.page + 1,
      this.pagination.limit,
      this.searchKey,
    );
  }

  ngOnInit(): void {
    this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
    this.telecallerService.fetchTelecallers();
  }

  handleFileUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.telecallerBookingsService.uploadTelecallerBookings(
        file,
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
          });
          this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error,
          });
        },
      );
    }
  }

  searchRecords() {
    this.telecallerBookingsService.fetchTelecallerBookings(
      1,
      this.pagination.limit,
      this.searchKey,
    );
  }

  updateChanges() {
    this.telecallerBookingsService.updateTelecallerBooking(
      this.rowUpdates(),
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
        });
        this.rowUpdates.set([]);
        this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
      },
      (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error,
        });
      },
    );
  }
}
