import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, computed, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
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

    userNameLabel = computed(() => {
        const fullName = this.authState().data?.data?.name;
        if (!fullName) return "";
        return fullName.split(' ')[0]?.[0]?.toUpperCase() + "" + fullName.split(' ')[1]?.[0]?.toUpperCase();
    });

    login(payload: LoginPayload, onSuccess?: (response: GenericResponse<LoginResponse>) => void, onError?: (err: string) => void): void {
        this.loginState.update((state) => ({ ...state, isLoading: true, error: null }));

        this.http.post<GenericResponse<LoginResponse>>(API.SIGN_IN, payload).subscribe(
            {
                next: ((response) => {
                    this.loginState.set({
                        isLoading: false,
                        error: null,
                        data: response,
                    });
                    this.authState.set({
                        isLoading: false,
                        error: null,
                        data: response,
                    });
                    onSuccess?.(response);
                }),
                error: ((error: HttpErrorResponse) => {
                    this.loginState.set({
                        isLoading: false,
                        error: getErrorMessage(error),
                        data: null,
                    });
                    onError?.(getErrorMessage(error));
                    return of(null);
                })
            }
        )
    }

    fetchAuth(onSuccess?: (response: GenericResponse<LoginResponse>) => void, onError?: (err: string) => void) {
        this.authState.update((state) => ({ ...state, isLoading: true, error: null }));

        this.http.post<GenericResponse<LoginResponse>>(API.AUTH, {}).subscribe(
            {
                next: ((response) => {
                    this.authState.set({
                        isLoading: false,
                        error: null,
                        data: response,
                    });
                    onSuccess?.(response);
                }),
                error: ((error: HttpErrorResponse) => {
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
            }
        )
    }

    logout() {
        this.authState.set({
            isLoading: false,
            error: null,
            data: null,
        });
        this.loginState.set({
            isLoading: false,
            error: null,
            data: null,
        });
        localStorage.removeItem('token');
        this.router.navigate(['']);
    }
}
