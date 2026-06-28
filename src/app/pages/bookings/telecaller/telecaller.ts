import { Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import {
  ColumnSettings,
  GridSettings,
  HotTableComponent,
  HotTableModule,
} from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { TELECALLER_BOOKINGS_TELECALLER_HOT_COLUMNS } from '@/app/lib/constants';
import { FollowUpFormService } from '@/app/services/followup-form.service';
import { FollowUpForm } from './components/follow-up-form/follow-up-form';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { MessageService } from 'primeng/api';
import { FollowUpTable } from './components/follow-up-table/follow-up-table';
import { HotViewButton } from './components/hot-view-button/hot-view-button';

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
  ],
  templateUrl: './telecaller.html',
  styleUrl: './telecaller.css',
})
export class TelecallerBooking implements OnInit {
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
        action: (bookingId: string) => this.afterBookingChoose(bookingId),
      },
    },
  ];

  telecallerBookingsService = inject(TelecallerBookingService);
  followUpFormService = inject(FollowUpFormService);
  messageService = inject(MessageService);

  isCreateFollowUpModalOpen = signal<boolean>(false);
  isViewFollowUpModalOpen = signal<boolean>(false);

  activeFollowUpBookingId = signal<string | null>(null);

  pagination = {
    first: 0,
    limit: 50,
  };

  hotMeta = {
    selectedRows: signal<number[]>([]),
  };

  searchKey = '';

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
  };

  hotModifierWatch = effect(() => {
    const bookingsData = this.bookingsData();
    if (!bookingsData) return;

    const hotInstance = this.hotTable?.hotInstance;
    if (!hotInstance) return;

    hotInstance.updateData(bookingsData.length > 0 ? bookingsData : this.data);

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

  afterBookingChoose(bookingId: string) {
    this.activeFollowUpBookingId.set(bookingId);
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

  get viewFollowUpModalTitle() {
    const currentBooking = this.telecallerBookingsService
      .telecallerBookings()
      .data?.data?.find((d) => d._id === this.activeFollowUpBookingId());
    return `View follow ups for ${currentBooking?.studentName} (${currentBooking?.mobile})`;
  }
}
