import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { Attendee, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class AttendeeService {
  attendees: WritableSignal<FetchState<Attendee[]>> = signal<FetchState<Attendee[]>>({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchAttendees(page: number = 1, limit: number = 10, onError?: ErrorFnCallback): void {
    this.attendees.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as Attendee[] },
    });

    this.http
      .get<GenericResponse<Attendee[]>>(API.GET_ATTENDEES, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
        },
      })
      .subscribe({
        next: (response) => {
          this.attendees.set({
            isLoading: false,
            error: null,
            data: {
              ...response,
              data: response.data?.map((d, i) => ({
                ...d,
                index: i + 1,
              })),
            },
          });
        },
        error: (error) => {
          this.attendees.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
      });
  }

  downloadAttendees(onError?: ErrorFnCallback): void {
    this.http.get(API.DOWNLOAD_ATTENDEES, { responseType: 'blob' }).subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attendee-registrations.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        onError?.(getErrorMessage(error));
      },
    });
  }
}
