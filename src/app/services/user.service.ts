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
    private router = inject(Router);
    private http = inject(HttpClient);

    fetchUsers(onError?: ErrorFnCallback): void {
        // if !error && !data, then fetch
        this.users.set({ isLoading: true, error: null, data: { data: generateNumbers(25) as unknown as User[] } });

        this.http.post<GenericResponse<User[]>>(API.USERS, {}).subscribe({
            next: (response) => {
                this.users.set({
                    isLoading: false,
                    error: null,
                    data: {
                        ...response, data: response!.data?.map((user, i) => ({
                            ...user,
                            index: i + 1,
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
