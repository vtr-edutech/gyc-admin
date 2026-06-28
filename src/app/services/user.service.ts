import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { ErrorFnCallback, FetchState, GenericResponse, User } from '../lib/types';
import { generateNumbers, getErrorMessage } from '../lib/utils';

export type SearchFilters = {
  name?: string;
  email?: string;
  mobile?: string;
  date?: Date | null;
};

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

  fetchUsers(
    page: number = 1,
    limit: number = 10,
    filters: SearchFilters = {},
    onError?: ErrorFnCallback,
  ): void {
    this.users.set({
      isLoading: true,
      error: null,
      data: { data: generateNumbers(limit) as unknown as User[] },
    });
    filters.date?.setHours(0, 0, 0, 0);

    this.http
      .post<GenericResponse<User[]>>(
        API.GET_USERS,
        {
          ...filters,
          date: filters.date?.toISOString(),
        },
        {
          params: {
            page: page.toString(),
            limit: limit.toString(),
          },
        },
      )
      .subscribe({
        next: (response) => {
          this.users.set({
            isLoading: false,
            error: null,
            data: {
              ...response,
              data:
                response!.data?.map((user, i) => ({
                  ...user,
                  index: (page - 1) * limit + i + 1,
                })) || [],
            },
          });
        },
        error: (error) => {
          this.users.set({
            isLoading: false,
            error: getErrorMessage(error),
            data: null,
          });
          onError?.(getErrorMessage(error));
        },
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
      },
    });
  }
}
