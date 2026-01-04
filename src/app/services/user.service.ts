import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { of } from 'rxjs';
import { catchError, tap, } from 'rxjs/operators';
import { FetchState, GenericResponse, User } from '../lib/types';
import { API_URL } from '../lib/constants';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private apiUrl = API_URL + '/admin/users';

    users: WritableSignal<FetchState<User[]>> = signal<FetchState<User[]>>({
        isLoading: true,
        error: null,
        data: null,
    });
    private router = inject(Router);
    private http = inject(HttpClient);

    constructor() {
        this.fetchUsers();
    }

    fetchUsers(): void {
        // if !error && !data, then fetch
        this.users.update((state) => ({ ...state, isLoading: true, error: null }));

        this.http.post<GenericResponse<User[]>>(this.apiUrl, {}).pipe(
            tap((response) => {
                this.users.set({
                    isLoading: false,
                    error: null,
                    data: response,
                });
            }),
            catchError((error: HttpErrorResponse) => {
                if (error.status === 401) {
                    localStorage.removeItem('token');
                    this.router.navigate(['']);
                    return of(null);
                }
                this.users.set({
                    isLoading: false,
                    error: error.error || error.message || 'An error occurred',
                    data: null,
                });
                return of(null);
            })
        ).subscribe();
    }
}
