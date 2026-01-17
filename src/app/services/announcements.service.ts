import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Announcement, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { HttpClient } from '@angular/common/http';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';
import { API } from '../lib/constants';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsService {
  announcements: WritableSignal<FetchState<Announcement[]>> = signal<FetchState<Announcement[]>>({
    isLoading: true,
    error: null,
    data: null,
  });
  private http = inject(HttpClient);

  fetchAnnouncements(page: number = 1, limit: number = 10, onError?: ErrorFnCallback): void {
    this.announcements.set({ isLoading: true, error: null, data: { data: generateNumbers(limit) as unknown as Announcement[] } });

    this.http.post<GenericResponse<Announcement[]>>(API.GET_ANNOUNCEMENTS, {}, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    }).subscribe({
      next: (response) => {
        this.announcements.set({
          isLoading: false,
          error: null,
          data: {
            ...response, data: response!.data?.map((user, i) => ({
              ...user,
              index: (page - 1) * limit + i + 1,
              createdAt: formatDates(user.createdAt),
              updatedAt: formatDates(user.updatedAt)
            })) || []
          }
        });
      },
      error: (error) => {
        this.announcements.set({
          isLoading: false,
          error: getErrorMessage(error),
          data: null,
        });
        onError?.(getErrorMessage(error));
      }
    });
  }
}
