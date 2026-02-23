import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { ErrorFnCallback, FetchState, GenericResponse, SlotBooking } from '../lib/types';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class SlotBookingService {
  slotBookings: WritableSignal<FetchState<SlotBooking[]>> = signal<FetchState<SlotBooking[]>>({
    isLoading: false,
    error: null,
    data: null,
  });

  createSlotBookingMeta: WritableSignal<FetchState<SlotBooking>> = signal<FetchState<SlotBooking>>({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchSlotBookings(page: number = 1, limit: number = 10, onError?: ErrorFnCallback): void {
    this.slotBookings.set({ isLoading: true, error: null, data: { data: generateNumbers(limit) as unknown as SlotBooking[] } });

    this.http.post<GenericResponse<SlotBooking[]>>(API.GET_SLOT_BOOKINGS, {}, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    }).subscribe({
      next: (response) => {
        this.slotBookings.set({
          isLoading: false,
          error: null,
          data: {
            ...response,
            data: response!.data?.map((booking, i) => ({
              ...booking,
              index: (page - 1) * limit + i + 1,
              attendedBy: booking.attendedBy ? {
                ...booking.attendedBy,
                updatedAt: formatDates(booking.attendedBy.attendedAt)
              } : null,
              createdAt: formatDates(booking.createdAt),
              updatedAt: formatDates(booking.updatedAt)
            })) || []
          }
        });
      },
      error: (error) => {
        this.slotBookings.set({
          isLoading: false,
          error: getErrorMessage(error),
          data: null,
        });
        onError?.(getErrorMessage(error));
      }
    });
  }


  updateSlotBooking(id: string, onSuccess?: Function, onError?: ErrorFnCallback) {
    this.createSlotBookingMeta.set({ isLoading: true, error: null, data: null });
    this.http.post<GenericResponse<SlotBooking>>(API.UPDATE_SLOT_BOOKING(id), {}).subscribe({
      next: (response) => {
        this.createSlotBookingMeta.set({ isLoading: false, error: null, data: response });
        this.fetchSlotBookings();
        onSuccess?.();
      },
      error: (error: HttpErrorResponse) => {
        this.createSlotBookingMeta.set({ isLoading: false, error: getErrorMessage(error), data: null });
        onError?.(getErrorMessage(error));
      }
    });
  }
}