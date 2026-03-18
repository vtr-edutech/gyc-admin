import { Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { MultiSelect } from 'primeng/multiselect';
import { Toast } from 'primeng/toast';
import { TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS } from '../../../lib/constants';
import { TelecallerAssignment, TelecallerAssignmentUpdate } from '../../../lib/types';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';
import { TelecallerService } from '../../../services/telecaller.service';
import { ConfirmPopup } from 'primeng/confirmpopup';

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
    ConfirmPopup,
  ],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
  providers: [MessageService, ConfirmationService],
})
export class TelecallerBookings implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);
  telecallerService = inject(TelecallerService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);

  pagination = {
    first: 0,
    limit: 50,
  };

  searchKey = '';

  hotMeta = {
    selectedRows: signal<number[]>([]),
  };

  rowUpdates = signal<TelecallerAssignmentUpdate[]>([]);

  selectedBookings = computed(() => {
    const data = this.telecallerBookingsService.telecallerBookings().data?.data;
    if (!data) return [];
    return this.hotMeta
      .selectedRows()
      .map((rowIndex) => data[rowIndex])
      .filter(Boolean);
  });

  selectedTelecallerIds = signal<string[]>([]);

  isAllSelectedActivated = computed(() => {
    const selected = this.selectedBookings();
    return selected.length > 0 && selected.every((booking) => !booking.isDeactivated);
  });

  isAllSelectedDeactivated = computed(() => {
    const selected = this.selectedBookings();
    return selected.length > 0 && selected.every((booking) => booking.isDeactivated);
  });

  hasAnyDeactivatedSelected = computed(() => {
    return this.selectedBookings().some((booking) => booking.isDeactivated);
  });

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
    manualRowMove: false,
    manualColumnMove: false,
    manualColumnResize: true,
    autoColumnSize: false,
    headerClassName: 'font-semibold text-lg',
    columns: TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS,
    hiddenColumns: {
      columns: [0, 1],
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
    afterOnCellMouseOver(event, coords, TD) {
      event.preventDefault();
      event.stopPropagation();
    },
    beforeKeyDown: function (event) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        Handsontable.dom.stopImmediatePropagation(event);
      }
    },
    cells(this: Handsontable.CellProperties, row, column, prop) {
      if (column <= 2) {
        this.readOnly = false;
        return this;
      }

      const isDeactivatedRow = this.instance.getDataAtRowProp(row, 'isDeactivated') as boolean;
      const assignedToColumnIndex = this.instance.propToCol('assignedTo');
      if (isDeactivatedRow) {
        this.readOnly = true;
        this.className = '!bg-red-200';
      } else {
        this.readOnly = false;
        this.className = '';
      }
      if (column === assignedToColumnIndex) {
        this.readOnly = true;
      }
      return this;
    },
  };

  // Computed signal bookingsData to simplify access to the data array
  bookingsData = computed(() => this.telecallerBookingsService.telecallerBookings().data?.data);

  // NOTES:1 Handle select column changes
  handleSelectRows = (changes: Handsontable.CellChange[]) => {
    changes.forEach((change) => {
      const [rowIndex, , , newValue] = change;
      if (newValue === true) {
        this.hotMeta.selectedRows.update((rows) => Array.from(new Set([...rows, rowIndex])));
      } else {
        this.hotMeta.selectedRows.update((rows) => rows.filter((row) => row !== rowIndex));
      }
    });
  };

  // NOTES:2 Register afterChange callback func to track row edits
  afterChangeCallback: Handsontable.GridSettings['afterChange'] = (changes, source) => {
    const validChangeSources: Handsontable.ChangeSource[] = [
      'UndoRedo.redo',
      'UndoRedo.undo',
      'edit',
      'Autofill.fill',
    ];
    if (!validChangeSources.includes(source) || !changes) return;

    // check select column change
    if (changes.every((change) => change[1] === 'select')) {
      this.handleSelectRows(changes);
      return;
    }

    changes.forEach((change) => {
      const [rowIndex, fieldName, , newValue] = change;
      const currentRow = this.bookingsData()?.[rowIndex];
      if (!currentRow) {
        return;
      }

      if (typeof fieldName !== 'string' || !(fieldName in currentRow)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Something went wrong in capturing update for Row ${rowIndex + 1}, Column ${fieldName}`,
        });
        return;
      }

      // Update existing update object if same id is edited
      const existingUpdate = this.rowUpdates().find((update) => update._id === currentRow._id);
      if (existingUpdate) {
        existingUpdate[fieldName as keyof TelecallerAssignmentUpdate] = newValue;
        const updatedUpdates = this.rowUpdates().map((update) => {
          if (update._id === currentRow._id) {
            return existingUpdate;
          }
          return update;
        });
        this.rowUpdates.set(updatedUpdates);
        return;
      }

      this.rowUpdates.update((updates) => [
        ...updates,
        {
          _id: currentRow._id,
          [fieldName]: newValue,
        },
      ]);
    });
  };

  hotModifierWatch = effect(() => {
    const bookingsData = this.telecallerBookingsService.telecallerBookings().data?.data;
    if (!bookingsData) return;

    const hotInstance = this.hotTable?.hotInstance;
    if (!hotInstance) return;

    // if there are rowUpdates, patch it in the bookingsData before populating so that changes stay across pagination changes
    this.rowUpdates().forEach((update) => {
      const rowIndex = bookingsData.findIndex((booking) => booking._id === update._id);
      if (rowIndex !== -1) {
        const updatedSubjects = (update.subjects as string)?.split(',');
        bookingsData[rowIndex] = {
          ...bookingsData[rowIndex],
          ...update,
          subjects: updatedSubjects,
        } as TelecallerAssignment;
      }
    });
    hotInstance.updateData(bookingsData);

    hotInstance.removeHook('afterChange', this.afterChangeCallback);
    hotInstance.addHook('afterChange', this.afterChangeCallback);
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
    this.telecallerService.fetchTelecallers(1, 100);
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

  confirmDeactivateUsers(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to deactivate the selected users?',
      header: 'Confirm Deactivate',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        // providing label here is not accepted by the button
        severity: 'danger',
      },
      acceptLabel: 'Deactivate',
      accept: () => {
        this.updateUserActivationStatus(false);
      },
    });
  }

  confirmActivateUsers(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure you want to activate the selected users?',
      header: 'Confirm Activate',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        // providing label here is not accepted by the button
        severity: 'success',
      },
      acceptLabel: 'Activate',
      accept: () => {
        this.updateUserActivationStatus(true);
      },
    });
  }

  updateUserActivationStatus(activate: boolean) {
    this.telecallerBookingsService.updateUsersActivationStatus(
      this.hotMeta
        .selectedRows()
        .map(
          (rowIndex) =>
            this.telecallerBookingsService.telecallerBookings().data!.data!.at(rowIndex)!._id!,
        ),
      activate,
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
        });
        this.rowUpdates.set([]);
        this.hotMeta.selectedRows.set([]);
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
        this.hotMeta.selectedRows.set([]);
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

  assignTelecallerBookings() {
    this.telecallerBookingsService.assignTelecallerBookings(
      this.hotMeta
        .selectedRows()
        .map(
          (rowIndex) =>
            this.telecallerBookingsService.telecallerBookings().data!.data!.at(rowIndex)!._id!,
        ),
      this.selectedTelecallerIds(),
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
        });
        this.rowUpdates.set([]);
        this.hotMeta.selectedRows.set([]);
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
