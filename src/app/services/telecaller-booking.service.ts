import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import {
  ErrorFnCallback,
  FetchState,
  GenericResponse,
  TelecallerAssignment,
  TelecallerAssignmentUpdate,
} from '../lib/types';
import { formatDates, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class TelecallerBookingService {
  telecallerBookings: WritableSignal<FetchState<TelecallerAssignment[]>> = signal<
    FetchState<TelecallerAssignment[]>
  >({
    isLoading: false,
    error: null,
    data: null,
  });
  telecallerBookingsMutationMeta: WritableSignal<FetchState<string>> = signal<FetchState<string>>({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchTelecallerBookings(
    page: number = 1,
    limit: number = 50,
    searchKey: string = '',
    onError?: ErrorFnCallback,
  ): void {
    this.telecallerBookings.set({
      isLoading: true,
      error: null,
      data: null,
    });

    this.http
      .get<GenericResponse<TelecallerAssignment[]>>(API.GET_TELECALLER_BOOKINGS, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          search: searchKey,
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
                response!.data?.map((response) => ({
                  ...response,
                  createdAt: formatDates(response.createdAt),
                  updatedAt: formatDates(response.updatedAt),
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

  uploadTelecallerBookings(file: File, onSuccess?: Function, onError?: ErrorFnCallback): void {
    this.telecallerBookingsMutationMeta.set({
      isLoading: true,
      error: null,
      data: null,
    });

    const formData = new FormData();
    formData.append('file', file);

    this.http.post<GenericResponse<string>>(API.UPLOAD_TELECALLER_BOOKINGS, formData).subscribe({
      next: (response) => {
        this.telecallerBookingsMutationMeta.set({
          isLoading: false,
          error: null,
          data: response,
        });
        onSuccess?.();
      },
      error: (error) => {
        this.telecallerBookingsMutationMeta.set({
          isLoading: false,
          error: getErrorMessage(error),
          data: null,
        });
        onError?.(getErrorMessage(error));
      },
    });
  }

  updateTelecallerBooking(
    updates: TelecallerAssignmentUpdate[],
    onSuccess?: Function,
    onError?: ErrorFnCallback,
  ) {
    this.telecallerBookingsMutationMeta.set({
      isLoading: true,
      error: null,
      data: null,
    });

    this.http.post<GenericResponse<string>>(API.UPDATE_TELECALLER_BOOKINGS, updates).subscribe({
      next: (response) => {
        this.telecallerBookingsMutationMeta.set({
          isLoading: false,
          error: null,
          data: response,
        });
        onSuccess?.();
      },
      error: (error) => {
        this.telecallerBookingsMutationMeta.set({
          isLoading: false,
          error: getErrorMessage(error),
          data: null,
        });
        onError?.(getErrorMessage(error));
      },
    });
  }

  updateUsersActivationStatus(ids: string[], activate: boolean, onSuccess?: Function, onError?: ErrorFnCallback) {
    this.telecallerBookingsMutationMeta.set({
      isLoading: true,
      error: null,
      data: null,
    });

    this.http.post<GenericResponse<string>>(API.UPDATE_TELECALLER_BOOKINGS_ACTIVATION_STATUS, {ids, activate }).subscribe({
      next: (response) => {
        this.telecallerBookingsMutationMeta.set({
          isLoading: false,
          error: null,
          data: response,
        });
        onSuccess?.();
      },
      error: (error) => {
        this.telecallerBookingsMutationMeta.set({
          isLoading: false,
          error: getErrorMessage(error),
          data: null,
        });
        onError?.(getErrorMessage(error));
      },
    });
  }
}
