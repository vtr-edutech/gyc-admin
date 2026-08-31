import { FollowUpTable } from '@/app/components/follow-up-table/follow-up-table';
import { HotViewButton } from '@/app/components/hot-view-button/hot-view-button';
import {
  TELECALLER_BOOKINGS_ADMIN_HOT_COLUMNS,
  TELECALLER_BOOKINGS_ADMIN_PREVIEW_HOT_COLUMNS,
} from '@/app/lib/constants';
import { TelecallerAssignmentUpdate, TelecallerBookingsPayload } from '@/app/lib/types';
import { customValidationDropdownRenderer, generatePlaceholderCells } from '@/app/lib/utils';
import { TelecallerBookingService } from '@/app/services/telecaller-booking.service';
import { TelecallerService } from '@/app/services/telecaller.service';
import { Component, computed, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GridSettings, HotTableComponent, HotTableModule } from '@handsontable/angular-wrapper';
import Handsontable from 'handsontable';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { Dialog } from 'primeng/dialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';
import { MultiSelect } from 'primeng/multiselect';
import { Paginator } from 'primeng/paginator';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';

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
    Select,
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

  previewHotTableReference: HotTableComponent | undefined;
  @ViewChild('preview', { static: false }) set tableRef(content: HotTableComponent) {
    if (content) this.previewHotTableReference = content;
  }

  telecallerBookingsService = inject(TelecallerBookingService);
  telecallerService = inject(TelecallerService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  router = inject(Router);

  isViewFollowUpModalOpen = signal<boolean>(false);
  isUploadPreviewModalOpen = signal<boolean>(false);

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

  /**
   * Selected telecallers from multiselect - used for assigning purpose
   */
  selectedTelecallerIds = signal<string[]>([]);

  /**
   * Selected telecaller from select - used for filtering purpose
   */
  selectedTelecallerId = signal<string | null>(null);

  selectedHotTableRows = computed(() => this.hotMeta.selectedRows().length);

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

  isTelecallerMutationsLoading = computed(
    () => this.telecallerBookingsService.telecallerBookingsMutationMeta().isLoading,
  );

  /**
   * Signal used to check whether any search or fitlering is active
   * Mainly used to swap between results count in pagination
   */
  isFitlerOrSearchActive = computed(
    () => this.searchKey !== '' || this.selectedTelecallerId() !== null,
  );

  /**
   * Data for the actual bookings that are loaded after page initialization, initially empty
   */
  readonly placeholderData = generatePlaceholderCells(50, this.COLUMN_CONFIG.length);

  /**
   * Data that is loaded for preview, initially empty
   */
  readonly placeholderPreviewData = generatePlaceholderCells(
    15,
    TELECALLER_BOOKINGS_ADMIN_PREVIEW_HOT_COLUMNS.length,
  );

  /**
   * The actual file that will be uploaded, to be parsed and saved
   */
  dataFile: File | undefined;

  /**
   * Settings for the main HoT
   */
  gridSettings: GridSettings = {
    stretchH: 'all',
    rowHeaders: ['1'],
    renderAllColumns: true,
    manualRowMove: false,
    manualColumnMove: false,
    manualColumnResize: true,
    autoColumnSize: false,
    viewportRowRenderingOffset: 15,
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

  /**
   * Grid settings used only for preview
   */
  previewGridSettings: GridSettings = {
    stretchH: 'all',
    rowHeaders: ['1'],
    renderAllColumns: true,
    manualRowMove: false,
    manualColumnMove: false,
    manualColumnResize: true,
    autoColumnSize: false,
    headerClassName: 'font-semibold text-lg',
    columns: TELECALLER_BOOKINGS_ADMIN_PREVIEW_HOT_COLUMNS,
    filters: true,
    dropdownMenu: {
      items: ['filter_by_value', 'filter_action_bar'],
    },
    hiddenColumns: {
      columns: [0],
    },
    columnSorting: {
      headerAction: true,
      indicator: false,
      sortEmptyCells: false,
    },
    allowRemoveRow: false,
    preventOverflow: 'horizontal',
    allowRemoveColumn: false,
  };

  // Computed signal bookingsData to simplify access to the data array
  bookingsData = computed(() => this.telecallerBookingsService.telecallerBookings().data?.data);

  constructor() {
    // Automatically run effect when selected telecaller ID changes
    effect(() => {
      const removeSearchParams = () => {
        this.router.navigate([], {
          relativeTo: this.router.routerState.root,
          replaceUrl: true,
          queryParams: {},
        });
      };
      const selectedTelecallerId = this.selectedTelecallerId();
      if (!selectedTelecallerId) {
        removeSearchParams();
        return;
      }
      this.telecallerBookingsService.fetchTelecallerBookings(
        1,
        this.pagination.limit,
        this.searchKey,
        selectedTelecallerId ? [selectedTelecallerId] : undefined,
        (err) => {
          console.error('Error thrown by fetch telecaller bookings by ID', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${err} - Telecaller ID is probably wrong`,
          });
          removeSearchParams();
        },
      );
    });

    const selectedTelecallerIdFromUrl =
      this.router.routerState.snapshot.root.queryParams['telecallerId'];
    if (selectedTelecallerIdFromUrl)
      this.selectedTelecallerId.set(String(selectedTelecallerIdFromUrl));
  }

  searchKeyChange() {
    if (this.searchKey === '')
      this.telecallerBookingsService.fetchTelecallerBookings(
        1,
        this.pagination.limit,
        undefined,
        this.selectedTelecallerId() ? [this.selectedTelecallerId()!] : undefined,
      );
    else this.searchRecords();
  }

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
        bookingsData[rowIndex] = {
          ...bookingsData[rowIndex],
          ...update,
        } as TelecallerBookingsPayload;
      }
    });
    hotInstance.updateData(bookingsData.length > 0 ? bookingsData : this.placeholderData);

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
      this.selectedTelecallerId() ? [this.selectedTelecallerId()!] : undefined,
    );
  }

  ngOnInit(): void {
    if (!this.selectedTelecallerId()) {
      this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
    }
    this.telecallerService.fetchTelecallers(1, 100);
  }

  handleFileUpload(event: Event | undefined, isPreview: boolean) {
    if (!this.dataFile && !event) throw new Error('Neither data file nor event is passed');

    let file: File | undefined;
    if (isPreview && event) {
      file = (event?.target as HTMLInputElement).files?.[0];
      this.dataFile = file;
    }

    if (this.dataFile) {
      this.telecallerBookingsService.uploadTelecallerBookings(
        this.dataFile,
        isPreview,
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.message,
          });
          if (isPreview) {
            const sampleBookingsData =
              this.telecallerBookingsService.telecallerBookingsMutationMeta().data?.data;
            if (!sampleBookingsData || !Array.isArray(sampleBookingsData)) return;
            /**
             * Set timeout here to make sure the instance object exists and method is run,
             * ONLY after angular CD runs and initializes the preview hot component
             */
            setTimeout(() => {
              const hotInstance = this.previewHotTableReference?.hotInstance;
              if (!hotInstance) return;
              hotInstance.updateData(sampleBookingsData);
            }, 0);
          } else {
            this.telecallerBookingsService.fetchTelecallerBookings(1, this.pagination.limit);
            this.toggleUploadPreviewModal(false);
          }
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
        this.searchKey = '';
        if (this.selectedTelecallerId()) {
          this.selectedTelecallerId.set(null); // This signal change calls fetchTelecallerBookings as a side effect
          return;
        }
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

  toggleViewFollowUpModal(open: boolean) {
    this.isViewFollowUpModalOpen.set(open);
  }

  toggleUploadPreviewModal(open: boolean) {
    this.isUploadPreviewModalOpen.set(open);
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
