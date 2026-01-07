import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { API } from '../lib/constants';
import { FetchState, GenericResponse, LoginPayload, LoginResponse } from '../lib/types';
import { getErrorMessage } from '../lib/utils';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    loginState: WritableSignal<FetchState<LoginResponse>> = signal<FetchState<LoginResponse>>({
        isLoading: false,
        error: null,
        data: null,
    });

    authState: WritableSignal<FetchState<LoginResponse>> = signal<FetchState<LoginResponse>>({
        isLoading: false,
        error: null,
        data: null,
    });

    login(payload: LoginPayload, onError?: (err: string) => void): void {
        this.loginState.update((state) => ({ ...state, isLoading: true, error: null }));

        this.http.post<GenericResponse<LoginResponse>>(API.SIGN_IN, payload).pipe(
            tap((response) => {
                console.log(response);

                if (response.data && response.data.token) {
                    localStorage.setItem('token', response.data.token);
                    this.router.navigate(['/home']);
                }
                this.loginState.set({
                    isLoading: false,
                    error: null,
                    data: response,
                });
            }),
            catchError((error: HttpErrorResponse) => {
                this.loginState.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                onError?.(getErrorMessage(error));
                return of(null);
            })
        ).subscribe();
    }

    fetchAuth(onError?: (err: string) => void) {
        this.authState.update((state) => ({ ...state, isLoading: true, error: null }));

        this.http.post<GenericResponse<LoginResponse>>(API.AUTH, {}).pipe(
            tap((response) => {
                console.log(response);

                if (this.router.url === '/') {
                    this.router.navigate(['/home'], { replaceUrl: true });
                }
                this.authState.set({
                    isLoading: false,
                    error: null,
                    data: response,
                });
            }),
            catchError((error: HttpErrorResponse) => {
                this.authState.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                if (error.status === 401) {
                    localStorage.removeItem('token');
                    if (this.router.url !== "/") {
                        this.router.navigate(['']);
                    }
                    onError?.('Please sign in again');
                    return of(null);
                }
                onError?.(getErrorMessage(error));
                return of(null);
            })
        ).subscribe();
    }
}
