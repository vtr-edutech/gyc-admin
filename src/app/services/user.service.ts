import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, tap, } from 'rxjs/operators';
import { FetchState, GenericResponse, User } from '../lib/types';
import { API } from '../lib/constants';
import { Router } from '@angular/router';
import { formatDates, getErrorMessage } from '../lib/utils';

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

    fetchUsers(onError?: (error: string) => void): void {
        // if !error && !data, then fetch
        this.users.update((state) => ({ ...state, isLoading: true, error: null }));

        this.http.post<GenericResponse<User[]>>(API.USERS, {}).pipe(
            tap((response) => {
                this.users.set({
                    isLoading: false,
                    error: null,
                    data: {
                        ...response, data: response.data?.map((user, i) => ({
                            ...user,
                            index: i + 1,
                            createdAt: formatDates(user.createdAt),
                            updatedAt: formatDates(user.updatedAt)
                        })) || []
                    }
                });
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    localStorage.removeItem('token');
                    this.router.navigate(['']);
                    onError?.('Please sign in again');
                    return of(null);
                }
                this.users.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                onError?.(getErrorMessage(error));
                return of(null);
            })
        ).subscribe();
    }
}
