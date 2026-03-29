import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { AdminUser, ErrorFnCallback, FetchState, GenericResponse, User } from '../lib/types';
import { generateNumbers, getErrorMessage } from '../lib/utils';

interface Referrer extends AdminUser<'referrer'> {
  referrals: number;
}

interface ReferrerById extends AdminUser<'referrer'> {
  referrals: Pick<User, '_id' | 'firstName' | 'lastName' | 'registerNo' | 'mobile' | 'createdAt'>[];
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

  referrerById: WritableSignal<FetchState<ReferrerById | null>> = signal<
    FetchState<ReferrerById | null>
  >({
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

  fetchReferrerById(referrerId: string, onError?: ErrorFnCallback) {
    this.referrerById.set({
      isLoading: true,
      error: null,
      data: null,
    });
    this.http.get<GenericResponse<ReferrerById>>(API.GET_REFERRER_BY_ID(referrerId)).subscribe({
      next: (response) => {
        this.referrerById.set({
          isLoading: false,
          error: null,
          data: response,
        });
      },
      error: (error) => {
        this.referrerById.set({
          isLoading: false,
          error: getErrorMessage(error),
          data: null,
        });
        onError?.(getErrorMessage(error));
      },
    });
  }
}
