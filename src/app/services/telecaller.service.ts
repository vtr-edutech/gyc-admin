import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { AdminUser, Announcement, CreateTelecallerPayload, ErrorFnCallback, FetchState, GenericResponse } from '../lib/types';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';
import { API } from '../lib/constants';

@Injectable({
    providedIn: 'root',
})
export class TelecallerService {
    telecallers: WritableSignal<FetchState<AdminUser<"telecaller">[]>> = signal<FetchState<AdminUser<"telecaller">[]>>({
        isLoading: false,
        error: null,
        data: null,
    });

    createTelecallerUserMeta: WritableSignal<FetchState<AdminUser<"telecaller">>> = signal<FetchState<AdminUser<"telecaller">>>({
        isLoading: false,
        error: null,
        data: null,
    });

    private http = inject(HttpClient);

    fetchTelecaller(page: number = 1, limit: number = 10, onError?: ErrorFnCallback): void {
        this.telecallers.set({ isLoading: true, error: null, data: { data: generateNumbers(limit) as unknown as AdminUser<"telecaller">[] } });

        this.http.post<GenericResponse<AdminUser<"telecaller">[]>>(API.GET_TELECALLERS, {}, {
            params: {
                page: page.toString(),
                limit: limit.toString()
            }
        }).subscribe({
            next: (response) => {
                this.telecallers.set({
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
                this.telecallers.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                onError?.(getErrorMessage(error));
            }
        });
    }

    createTelecaller(data: CreateTelecallerPayload, onSuccess?: Function, onError?: ErrorFnCallback): void {
        this.createTelecallerUserMeta.set({ isLoading: true, error: null, data: null });
        this.http.post<GenericResponse<AdminUser<"telecaller">>>(API.CREATE_ANNOUNCEMENT, data).subscribe({
            next: (response) => {
                this.createTelecallerUserMeta.set({ isLoading: false, error: null, data: response });
                this.fetchTelecaller();
                onSuccess?.();
            },
            error: (error: HttpErrorResponse) => {
                this.createTelecallerUserMeta.set({ isLoading: false, error: getErrorMessage(error), data: null });
                onError?.(getErrorMessage(error));
            }
        });
    }
}