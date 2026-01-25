import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { API } from '../lib/constants';
import { ErrorFnCallback, FetchState, GenericResponse, User } from '../lib/types';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    users: WritableSignal<FetchState<User[]>> = signal<FetchState<User[]>>({
        isLoading: true,
        error: null,
        data: null,
    });
    private http = inject(HttpClient);

    fetchUsers(page: number = 1, limit: number = 10, filters: any = {}, onError?: ErrorFnCallback): void {
        this.users.set({ isLoading: true, error: null, data: { data: generateNumbers(limit) as unknown as User[] } });

        this.http.post<GenericResponse<User[]>>(API.GET_USERS, { ...filters }, {
            params: {
                page: page.toString(),
                limit: limit.toString()
            }
        }).subscribe({
            next: (response) => {
                this.users.set({
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
                this.users.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                onError?.(getErrorMessage(error));
            }
        });
    }

    downloadUsers(data: string[], onError?: ErrorFnCallback) {
        this.http.post(API.DOWNLOAD_USERS, data, { responseType: 'blob' }).subscribe({
            next: (response) => {
                const url = window.URL.createObjectURL(response);
                const a = document.createElement('a');
                a.href = url;
                a.download = `GYC Users from ${new Date(data[0]).toLocaleDateString()}-${new Date(data[1]).toLocaleDateString()}.xlsx`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            },
            error: (error) => {
                onError?.(getErrorMessage(error));
            }
        });
    }
}
