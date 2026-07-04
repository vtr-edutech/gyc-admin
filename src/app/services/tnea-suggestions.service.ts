import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { ErrorFnCallback, FetchState, GenericResponse, TneaSuggestionUsage } from '../lib/types';
import { generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class TneaSuggestionService {
  tneaSuggestions: WritableSignal<FetchState<TneaSuggestionUsage[]>> = signal<
    FetchState<TneaSuggestionUsage[]>
  >({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchTneaSuggestions(
    page: number = 1,
    limit: number = 10,
    params?: { search?: string; startDate?: string; endDate?: string },
    onError?: ErrorFnCallback,
  ): void {
    this.tneaSuggestions.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as TneaSuggestionUsage[] },
    });

    this.http
      .get<GenericResponse<TneaSuggestionUsage[]>>(API.TNEA_SUGGESTIONS, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          search: params?.search || '',
          startDate: params?.startDate || '',
          endDate: params?.endDate || '',
        },
      })
      .subscribe({
        next: (response) => {
          this.tneaSuggestions.set({
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
          this.tneaSuggestions.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
      });
  }

  downloadTneaSuggestions(onError?: ErrorFnCallback): void {
    this.http.get(API.TNEA_SUGGESTIONS_DOWNLOAD, { responseType: 'blob' }).subscribe({
      next: (response) => {
        const blob = new Blob([response], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tnea-suggestions-usages.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        onError?.(getErrorMessage(error));
      },
    });
  }
}
