import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { Review, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  reviews: WritableSignal<FetchState<Review[]>> = signal<FetchState<Review[]>>({
    isLoading: false,
    error: null,
    data: null,
  });
  reviewsMutation: WritableSignal<FetchState<Review[]>> = signal<FetchState<Review[]>>({
    isLoading: false,
    error: null,
    data: null,
  });

  private http = inject(HttpClient);

  fetchReviews(
    page: number = 1,
    limit: number = 10,
    search: string = '',
    dateRange?: [Date?, Date?],
    onError?: ErrorFnCallback,
  ): void {
    this.reviews.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as Review[] },
    });

    // Adjust dates for start and end since the DB is in IST
    dateRange?.[0]?.setHours(0, 0, 0, 0);
    dateRange?.[1]?.setHours(23, 59, 59, 999);

    this.http
      .get<GenericResponse<Review[]>>(API.GET_REVIEWS, {
        params: {
          page: page.toString(),
          limit: limit.toString(),
          search,
          startDate: dateRange?.[0]?.toISOString() ?? '',
          endDate: dateRange?.[1]?.toISOString() ?? '',
        },
      })
      .subscribe({
        next: (response) => {
          this.reviews.set({
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
          this.reviews.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
      });
  }

  togglePublish(id: string, onSuccess?: Function, onError?: ErrorFnCallback): void {
    this.reviewsMutation.set({
      isLoading: true,
      error: null,
      data: null,
    });
    this.http.post(API.PUBLISH_REVIEW(id), null).subscribe({
      next: () => {
        this.reviewsMutation.set({
          isLoading: false,
          error: null,
          data: null,
        });
        onSuccess?.();
      },
      error: (error) => {
        this.reviewsMutation.set({
          isLoading: false,
          error: error,
          data: null,
        });
        onError?.(getErrorMessage(error));
      },
    });
  }
}
