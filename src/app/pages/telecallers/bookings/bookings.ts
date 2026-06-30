import { HotViewButton } from '@/app/components/hot-view-button/hot-view-button';
import { TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS } from '@/app/lib/constants';
import { TelecallerAssignmentUpdate, TelecallerBookingsPayload } from '@/app/lib/types';
import { customValidationDropdownRenderer } from '@/app/lib/utils';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { TelecallerService } from '@/app/services/telecaller.service';
import { Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { Dialog } from 'primeng/dialog';
import { FollowUpTable } from '@/app/components/follow-up-table/follow-up-table';

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
    Dialog,
    FollowUpTable,
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

  isViewFollowUpModalOpen = signal<boolean>(false);

  COLUMN_CONFIG = [
    ...TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS,
    {
      data: '_id',
      title: 'Actions',
      width: 100,
      readOnly: true,
      renderer: HotViewButton,
      rendererProps: {
        action: (bookingId: string) => this.afterBookingChoose(bookingId),
      },
    },
  ];

  pagination = {
    first: 0,
    limit: 50,
  };

  searchKey = '';

  hotMeta = {
    selectedRows: signal<number[]>([]),
  };

  activeFollowUpBookingId = signal<string | null>(null);

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

  data = Array.from({ length: 50 }, () =>
    Array.from({ length: this.COLUMN_CONFIG.length }, () => ''),
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
    columns: this.COLUMN_CONFIG,
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
    preventOverflow: 'horizontal',
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
      // NOTES:3 set custom renderer for dataValidationStatus column once again to avoid default renderer forced
      if (prop === 'dataValidationStatus') {
        this.renderer = customValidationDropdownRenderer;
        return this;
      }

      const actionsColumnsIndex = this.instance.countCols() - 1; // Reliable way to get last index
      const assignedToColumnIndex = this.instance.propToCol('assignedTo');
      const createdAtColumnIndex = this.instance.propToCol('createdAt');
      const updatedAtColumnIndex = this.instance.propToCol('updatedAt');

      if (column === actionsColumnsIndex) {
        this.readOnly = true;
        // Get the base configuration for this column to prevent it from resetting
        const configs = this.instance.getSettings().columns;
        const colConfig = Array.isArray(configs) ? configs[column] : null;
        if (colConfig && colConfig.renderer) {
          this.renderer = colConfig.renderer;
        }
        return this;
      }

      if (column <= 2) {
        this.readOnly = false;
        return this;
      }

      const isDeactivatedRow = this.instance.getDataAtRowProp(row, 'isDeactivated') as boolean;
      if (isDeactivatedRow) {
        this.readOnly = true;
        this.className = '!bg-red-200';
      } else {
        this.readOnly = false;
        this.className = '';
      }
      if ([assignedToColumnIndex, createdAtColumnIndex, updatedAtColumnIndex].includes(column)) {
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
        /**
         * when selecting one / more rows with assignedTo not empty, then prepare the control signal for multiselect with values
         * only if the multiselect is empty
         */
        if (this.bookingsData()?.at(rowIndex)?.isDeactivated) {
          this.selectedTelecallerIds.set([]);
          return;
        }
        if (this.selectedTelecallerIds().length === 0) {
          this.selectedTelecallerIds.set(
            this.bookingsData()
              ?.filter(
                (booking, index) =>
                  index === rowIndex && booking.assignedTo && booking.assignedTo.length !== 0,
              )
              .flatMap(
                (booking) => booking.assignedTo?.map((telecaller) => telecaller._id) ?? [],
              ) ?? [],
          );
        }
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
        } as TelecallerBookingsPayload;
      }
    });
    hotInstance.updateData(bookingsData.length > 0 ? bookingsData : this.data);

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
    const selectedStudentRecords = this.hotMeta
      .selectedRows()
      .map((rowIndex) =>
        this.telecallerBookingsService.telecallerBookings().data!.data!.at(rowIndex),
      )
      .filter(Boolean);
    if (selectedStudentRecords.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No students selected',
      });
      return;
    }

    const selectedStudentIds = selectedStudentRecords.map((record) => record!._id!);
    this.telecallerBookingsService.updateUsersActivationStatus(
      selectedStudentIds,
      activate,
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
        });
        this.rowUpdates.set([]);
        this.hotMeta.selectedRows.set([]);
        this.telecallerBookingsService.fetchTelecallerBookings(
          1,
          this.pagination.limit,
          this.searchKey,
        );
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
        this.telecallerBookingsService.fetchTelecallerBookings(
          1,
          this.pagination.limit,
          this.searchKey,
        );
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
    const selectedStudentIds = this.hotMeta
      .selectedRows()
      .map(
        (rowIndex) =>
          this.telecallerBookingsService.telecallerBookings().data!.data!.at(rowIndex)!._id!,
      );
    this.telecallerBookingsService.assignTelecallerBookings(
      selectedStudentIds,
      this.selectedTelecallerIds(),
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
        });
        this.rowUpdates.set([]);
        this.hotMeta.selectedRows.set([]);
        this.selectedTelecallerIds.set([]);
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

  toggleViewFollowUpModal(open: boolean) {
    this.isViewFollowUpModalOpen.set(open);
  }

  afterBookingChoose(bookingId: string) {
    this.activeFollowUpBookingId.set(bookingId);
    this.toggleViewFollowUpModal(true);
  }

  get viewFollowUpModalTitle() {
    const currentBooking = this.bookingsData()?.find(
      (d) => d._id === this.activeFollowUpBookingId(),
    );
    return `View follow ups for ${currentBooking?.studentName} (${currentBooking?.mobile})`;
  }
}
