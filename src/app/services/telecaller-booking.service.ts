import { API } from '@/app/lib/constants';
import {
  ErrorFnCallback,
  FetchState,
  GenericResponse,
  TelecallerAssignmentUpdate,
  TelecallerBookingsPayload,
} from '@/app/lib/types';
import { getErrorMessage } from '@/app/lib/utils';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';

type TelecallerBookingMutationResponse =
  | { inserted: number; total: number }
  | { rows: Partial<TelecallerBookingsPayload>[]; total: number; rawTotal: number }
  | string;

@Injectable({
  providedIn: 'root',
})
export class TelecallerBookingService {
  telecallerBookings: WritableSignal<FetchState<TelecallerBookingsPayload[]>> = signal<
    FetchState<TelecallerBookingsPayload[]>
  >({
    isLoading: false,
    error: null,
    data: null,
  });
  telecallerBookingsMutationMeta: WritableSignal<FetchState<TelecallerBookingMutationResponse>> =
    signal<FetchState<TelecallerBookingMutationResponse>>({
      isLoading: false,
      error: null,
      data: null,
    });

  private http = inject(HttpClient);

  fetchTelecallerBookings(
    page: number = 1,
    limit: number = 50,
    searchKey: string = '',
    telecallerIds?: string[],
    onError?: ErrorFnCallback,
  ): void {
    this.telecallerBookings.set({
      isLoading: true,
      error: null,
      data: null,
    });

    const paramsObject = {
      page: page.toString(),
      limit: limit.toString(),
      search: searchKey,
      ...(telecallerIds ? { telecallerIds: telecallerIds.join(',') } : {}),
    };

    const params: HttpParams = new HttpParams({
      fromObject: paramsObject,
    });

    this.http
      .get<GenericResponse<TelecallerBookingsPayload[]>>(API.GET_TELECALLER_BOOKINGS, {
        params,
      })
      .subscribe({
        next: (response) => {
          this.telecallerBookings.set({
            isLoading: false,
            error: null,
            data: {
              ...response,
              data: response!.data || [],
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

  uploadTelecallerBookings(
    file: File,
    preview?: boolean,
    onSuccess?: Function,
    onError?: ErrorFnCallback,
  ): void {
    this.telecallerBookingsMutationMeta.set({
      isLoading: true,
      error: null,
      data: null,
    });

    const formData = new FormData();
    formData.append('file', file);

    const params = preview ? { preview: true } : undefined;

    this.http
      .post<
        GenericResponse<TelecallerBookingMutationResponse>
      >(API.UPLOAD_TELECALLER_BOOKINGS, formData, { params })
      .subscribe({
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

  updateUsersActivationStatus(
    ids: string[],
    activate: boolean,
    onSuccess?: Function,
    onError?: ErrorFnCallback,
  ) {
    this.telecallerBookingsMutationMeta.set({
      isLoading: true,
      error: null,
      data: null,
    });

    this.http
      .post<
        GenericResponse<string>
      >(API.UPDATE_TELECALLER_BOOKINGS_ACTIVATION_STATUS, { ids, activate })
      .subscribe({
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

  assignTelecallerBookings(
    bookingIds: string[],
    telecallerIds: string[],
    onSuccess?: Function,
    onError?: ErrorFnCallback,
  ) {
    this.telecallerBookingsMutationMeta.set({
      isLoading: true,
      error: null,
      data: null,
    });

    this.http
      .post<GenericResponse<string>>(API.ASSIGN_TELECALLER_BOOKINGS, { bookingIds, telecallerIds })
      .subscribe({
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
