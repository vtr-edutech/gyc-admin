import { Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { TELECALLER_BOOKINGS_TELECALLER_HOT_COLUMNS } from '../../../lib/constants';
import { TelecallerBookingService } from '../../../services/telecaller-booking.service';
import { FollowUpForm } from './components/follow-up-form/follow-up-form';

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
  ],
  templateUrl: './telecaller.html',
  styleUrl: './telecaller.css',
})
export class TelecallerBooking implements OnInit {
  @ViewChild('hotTable') hotTable!: HotTableComponent;

  telecallerBookingsService = inject(TelecallerBookingService);

  isFollowUpModalOpen = signal<boolean>(false);

  pagination = {
    first: 0,
    limit: 50,
  };

  hotMeta = {
    selectedRows: signal<number[]>([]),
  };

  searchKey = '';

  data = Array.from({ length: 50 }, (_, i) =>
    Array.from({ length: TELECALLER_BOOKINGS_TELECALLER_HOT_COLUMNS.length }, (_, j) => ''),
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
    columns: TELECALLER_BOOKINGS_TELECALLER_HOT_COLUMNS,
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
    changes.forEach((change) => {
      const [rowIndex, , , newValue] = change;
      if (newValue === true) {
        this.hotMeta.selectedRows.update((rows) => Array.from(new Set([...rows, rowIndex])));
      } else {
        this.hotMeta.selectedRows.update((rows) => rows.filter((row) => row !== rowIndex));
      }
    });
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
    );
  }

  toggleFollowUpModal(open: boolean) {
    this.isFollowUpModalOpen.set(open);
  }
}
