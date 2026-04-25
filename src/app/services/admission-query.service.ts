import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { AdmissionQuery, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class AdmissionQueryService {
  admissionQueries: WritableSignal<FetchState<AdmissionQuery[]>> = signal<
    FetchState<AdmissionQuery[]>
  >({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchAdmissionQueries(page: number = 1, limit: number = 10, onError?: ErrorFnCallback): void {
    this.admissionQueries.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as AdmissionQuery[] },
    });

    this.http
      .get<GenericResponse<AdmissionQuery[]>>(API.GET_ADMISSIONS_QUERIES, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
        },
      })
      .subscribe({
        next: (response) => {
          this.admissionQueries.set({
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
          this.admissionQueries.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
      });
  }

  downloadAdmissionQueries(dateRange: [Date?, Date?], onError?: ErrorFnCallback): void {
    this.http
      .post(API.DOWNLOAD_ADMISSIONS_QUERIES, dateRange ?? [], { responseType: 'blob' })
      .subscribe({
        next: (response) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `admission-queries_${dateRange?.[0]?.toISOString().split('T')[0] ?? 'all'} to ${dateRange?.[1]?.toISOString().split('T')[0] ?? 'all'}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error) => {
          onError?.(getErrorMessage(error));
        },
      });
  }
}
