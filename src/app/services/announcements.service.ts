import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Announcement, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';
import { API } from '../lib/constants';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsService {
  announcements: WritableSignal<FetchState<Announcement[]>> = signal<FetchState<Announcement[]>>({
    isLoading: false,
    error: null,
    data: null,
  });

  createAnnouncementMeta: WritableSignal<FetchState<Announcement>> = signal<FetchState<Announcement>>({
    isLoading: false,
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

  createAnnouncement(data: Announcement, onSuccess?: Function, onError?: ErrorFnCallback): void {
    this.createAnnouncementMeta.set({ isLoading: true, error: null, data: null });
    this.http.post<GenericResponse<Announcement>>(API.CREATE_ANNOUNCEMENT, data).subscribe({
      next: (response) => {
        this.createAnnouncementMeta.set({ isLoading: false, error: null, data: response });
        this.fetchAnnouncements();
        onSuccess?.();
      },
      error: (error: HttpErrorResponse) => {
        this.createAnnouncementMeta.set({ isLoading: false, error: getErrorMessage(error), data: null });
        onError?.(getErrorMessage(error));
      }
    });
  }

  updateAnnouncement(data: Announcement, onSuccess?: Function, onError?: ErrorFnCallback) {
    this.createAnnouncementMeta.set({ isLoading: true, error: null, data: null });
    this.http.post<GenericResponse<Announcement>>(API.UPDATE_ANNOUNCEMENT, data).subscribe({
      next: (response) => {
        this.createAnnouncementMeta.set({ isLoading: false, error: null, data: response });
        this.fetchAnnouncements();
        onSuccess?.();
      },
      error: (error: HttpErrorResponse) => {
        this.createAnnouncementMeta.set({ isLoading: false, error: getErrorMessage(error), data: null });
        onError?.(getErrorMessage(error));
      }
    });
  }

  deleteAnnouncement(announcementId: string, onSuccess?: Function, onError?: ErrorFnCallback) {
    this.createAnnouncementMeta.set({ isLoading: true, error: null, data: null });
    this.http.post<GenericResponse<Announcement>>(API.DELETE_ANNOUNCEMENT, { _id: announcementId }).subscribe({
      next: (response) => {
        this.createAnnouncementMeta.set({ isLoading: false, error: null, data: response });
        this.fetchAnnouncements();
        onSuccess?.();
      },
      error: (error: HttpErrorResponse) => {
        this.createAnnouncementMeta.set({ isLoading: false, error: getErrorMessage(error), data: null });
        onError?.(getErrorMessage(error));
      }
    });
  }
}