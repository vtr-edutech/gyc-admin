import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { AdminUser, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';

interface Referrer extends AdminUser<'referrer'> {
  referrals: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReferrersService {
  referrers: WritableSignal<FetchState<Referrer[]>> = signal<FetchState<Referrer[]>>({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchReferrers(
    search: string = '',
    page: number = 1,
    limit: number = 10,
    onError?: ErrorFnCallback,
  ): void {
    this.referrers.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as Referrer[] },
    });

    this.http
      .get<GenericResponse<Referrer[]>>(API.GET_REFERRERS, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          search,
        },
      })
      .subscribe({
        next: (response) => {
          this.referrers.set({
            isLoading: false,
            error: null,
            data: {
              ...response,
              data:
                response!.data?.map((booking, i) => ({
                  ...booking,
                  index: (page - 1) * limit + i + 1,
                })) || [],
            },
          });
        },
        error: (error) => {
          this.referrers.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
      });
  }
}
