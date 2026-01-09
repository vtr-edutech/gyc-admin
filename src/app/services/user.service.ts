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

    fetchUsers(page: number = 1, limit: number = 10, onError?: ErrorFnCallback): void {
        this.users.set({ isLoading: true, error: null, data: { data: generateNumbers(limit) as unknown as User[] } });

        this.http.post<GenericResponse<User[]>>(API.USERS, {}, {
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
}
