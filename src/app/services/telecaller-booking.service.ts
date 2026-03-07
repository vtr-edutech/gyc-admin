import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { AdminUser, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class TelecallerBookingService {
  telecallerBookings: WritableSignal<FetchState<AdminUser<'telecaller'>[]>> = signal<
    FetchState<AdminUser<'telecaller'>[]>
  >({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchTelecallerBookings(page: number = 1, limit: number = 50, onError?: ErrorFnCallback): void {
    this.telecallerBookings.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as AdminUser<'telecaller'>[] },
    });

    this.http
      .get<GenericResponse<AdminUser<'telecaller'>[]>>(API.GET_TELECALLER_BOOKINGS, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
        },
      })
      .subscribe({
        next: (response) => {
          this.telecallerBookings.set({
            isLoading: false,
            error: null,
            data: {
              ...response,
              data:
                response!.data?.map((user, i) => ({
                  ...user,
                  index: (page - 1) * limit + i + 1,
                  createdAt: formatDates(user.createdAt),
                  updatedAt: formatDates(user.updatedAt),
                })) || [],
            },
          });
        },
        error: (error) => {
          this.telecallerBookings.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
      });
  }
}
