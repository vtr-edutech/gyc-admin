import { HotViewButton } from '@/app/components/hot-view-button/hot-view-button';
import { TELECALLER_BOOKINGS_TELECALLER_HOT_COLUMNS } from '@/app/lib/constants';
import { FollowUpFormService } from '@/app/services/followup-form.service';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import {
  Component,
  computed,
  effect,
  inject,
  OnDestroy,
  OnInit,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { FollowUpForm } from './components/follow-up-form/follow-up-form';
import { FollowUpTable } from '@/app/components/follow-up-table/follow-up-table';
import { TelecallerAssignmentUpdate, TelecallerBookingsFetchResponse } from '@/app/lib/types';
import { generatePlaceholderCells } from '@/app/lib/utils';
import { TelecallerBookingUpdateHistoryTable } from '@/app/components/telecaller-booking-update-history-table/telecaller-booking-update-history-table';

@Component({
  selector: 'app-bookings-telecaller',
  imports: [
    Toast,
    ConfirmPopup,
    HotTableModule,
    Button,
    ProgressSpinner,
    Paginator,
    DialogModule,
    FollowUpForm,
    FollowUpTable,
    TelecallerBookingUpdateHistoryTable,
  ],
  templateUrl: './telecaller.html',
  styleUrl: './telecaller.css',
})
export class TelecallerBooking implements OnInit, OnDestroy {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  COLUMN_CONFIG = [
    ...TELECALLER_BOOKINGS_TELECALLER_HOT_COLUMNS,
    {
      data: '_id',
      title: 'Actions',
      width: 100,
      readOnly: true,
      renderer: HotViewButton,
      rendererProps: {
        onFollowUpViewClick: (bookingId: string) => this.afterBookingChoose(bookingId),
        onUpdateHistoryViewClick: (bookingId: string) => this.afterUpdateHistoryChoose(bookingId),
      },
    },
  ];

  telecallerBookingsService = inject(TelecallerBookingService);
  followUpFormService = inject(FollowUpFormService);
  messageService = inject(MessageService);

  isCreateFollowUpModalOpen = signal<boolean>(false);
  isViewFollowUpModalOpen = signal<boolean>(false);
  isBookingUpdateHistoryModalOpen = signal<boolean>(false);

  activeBookingId = signal<string | null>(null);

  rowUpdates = signal<TelecallerAssignmentUpdate[]>([]);

  pagination = {
    first: 0,
    limit: 50,
  };

  hotMeta = {
    selectedRows: signal<number[]>([]),
  };

  searchKey = '';

  data = generatePlaceholderCells(50, this.COLUMN_CONFIG.length);

  gridSettings: GridSettings = {
    stretchH: 'all',
    rowHeaders: ['1'],
    renderAllColumns: true,
    manualRowMove: false,
    manualColumnMove: false,
    manualColumnResize: true,
    fixedColumnsLeft: 5,
    autoColumnSize: false,
    headerClassName: 'font-semibold text-lg',
    columns: this.COLUMN_CONFIG,
    hiddenColumns: {
      columns: [0, 1],
      indicators: false,
    },
    contextMenu: {
      items: {
        hidden_columns_hide: {
          callback: (key, selection, clickEvent) => {
            const selectedColumnsToHide = selection
              .map((range) => range.start.col)
              .filter((colIndex) => colIndex > 5); // Skip past the first 5 columns (_id, isDeactivated, select, refNo, studentName)
            if (selectedColumnsToHide.length === 0) return;

            const hotInstance = this.hotTable?.hotInstance;
            if (!hotInstance) return;

            hotInstance.getPlugin('hiddenColumns')?.hideColumns(selectedColumnsToHide);
            hotInstance.render();
          },
        },
      },
    },
    filters: true,
    columnSorting: {
      headerAction: true,
      indicator: false,
      sortEmptyCells: false,
    },
    allowRemoveRow: false,
    allowRemoveColumn: false,
    preventOverflow: 'horizontal',
    afterOnCellMouseOver(event, coords, TD) {
      event.preventDefault();
      event.stopPropagation();
    },
    beforeKeyDown: function (event) {
      if (event.key === 'Backspace' || event.key === 'Delete') {
        Handsontable.dom.stopImmediatePropagation(event);
      }
    },
  };

  // Computed signal bookingsData to simplify access to the data array
  bookingsData = computed(() => this.telecallerBookingsService.telecallerBookings().data?.data);

  handleSelectRows = (changes: Handsontable.CellChange[]) => {
    this.hotMeta.selectedRows.update((rows) => {
      let updatedRows = [...rows];
      changes.forEach(([rowIndex, , , newValue]) => {
        if (newValue === true) {
          updatedRows.push(rowIndex);
        } else {
          updatedRows = updatedRows.filter((r) => r !== rowIndex);
        }
      });
      return Array.from(new Set(updatedRows));
    });

    const bookingIds = this.getBookingIdsFromSelectedRows();

    this.followUpFormService.setBookingIds(bookingIds);
  };

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
      const [rowIndex, fieldName, oldValue, newValue] = change;
      if (oldValue === newValue) return;

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
    const bookingsData = this.bookingsData();
    if (!bookingsData) return;

    const hotInstance = this.hotTable?.hotInstance;
    if (!hotInstance) return;

    untracked(() => {
      this.rowUpdates().forEach((update) => {
        const rowIndex = bookingsData.findIndex((booking) => booking._id === update._id);
        if (rowIndex !== -1) {
          bookingsData[rowIndex] = {
            ...bookingsData[rowIndex],
            ...update,
          } as TelecallerBookingsFetchResponse;
        }
      });
    });

    hotInstance.updateData(bookingsData.length > 0 ? bookingsData : this.data);

    // Since deactivated assignments are automatically unassigned to telecallers, there won't be a need to check and disable and red bg the cells

    hotInstance.removeHook('afterChange', this.afterChangeCallback);
    hotInstance.addHook('afterChange', this.afterChangeCallback);
  });

  ngOnInit(): void {
    this.fetchTelecallerBookings();
  }

  onPageChange(event: Paginator['paginatorState']) {
    this.pagination.first = event.first;
    this.pagination.limit = event.rows;
    this.fetchTelecallerBookings();
  }

  fetchTelecallerBookings() {
    this.telecallerBookingsService.fetchTelecallerBookings(
      this.pagination.first,
      this.pagination.limit,
      this.searchKey,
      undefined,
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'There was an error while fetching telecaller bookings',
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

  /**
   * Helper function to set modal control signal and reset form without touching
   * - bookingIds
   * - calledDate
   * @param open Boolean value to control opening or closing
   */
  toggleCreateFollowUpModal(open: boolean) {
    this.isCreateFollowUpModalOpen.set(open);
    if (!open)
      this.followUpFormService.followUpFormGroup.reset({
        bookingIds: this.getBookingIdsFromSelectedRows(),
        calledDate: new Date(),
      });
  }

  toggleViewFollowUpModal(open: boolean) {
    this.isViewFollowUpModalOpen.set(open);
  }

  toggleBookingUpdateHistoryModal(open: boolean) {
    this.isBookingUpdateHistoryModalOpen.set(open);
  }

  afterUpdateHistoryChoose(bookingId: string) {
    this.activeBookingId.set(bookingId);
    this.toggleBookingUpdateHistoryModal(true);
  }

  afterBookingChoose(bookingId: string) {
    this.activeBookingId.set(bookingId);
    this.toggleViewFollowUpModal(true);
  }

  getBookingIdsFromSelectedRows() {
    return (
      this.bookingsData()
        ?.filter((_, index) => this.hotMeta.selectedRows().includes(index))
        .map((row) => row._id) ?? []
    );
  }

  onCloseModal() {
    this.toggleCreateFollowUpModal(false);
    this.hotMeta.selectedRows.set([]);
    this.fetchTelecallerBookings();
  }

  showAllColumns() {
    const plugin = this.hotTable.hotInstance?.getPlugin('hiddenColumns');
    if (!plugin) return;
    plugin.showColumns(plugin.getHiddenColumns().filter((col) => ![0, 1].includes(col)));
    this.hotTable.hotInstance?.render();
  }

  get viewFollowUpModalTitle() {
    const currentBooking = this.bookingsData()?.find((d) => d._id === this.activeBookingId());
    return `View follow ups for ${currentBooking?.studentName} (${currentBooking?.mobile})`;
  }

  get viewBookingUpdateHisotryModalTitle() {
    const currentBooking = this.bookingsData()?.find((d) => d._id === this.activeBookingId());
    return `View update history for ${currentBooking?.studentName} (${currentBooking?.mobile})`;
  }

  ngOnDestroy(): void {
    this.telecallerBookingsService.resetTelecallerBookingsMutation();
  }
}
