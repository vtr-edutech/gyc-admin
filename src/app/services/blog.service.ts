import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { API } from '../lib/constants';
import { ErrorFnCallback, FetchState, GenericResponse, Blog } from '../lib/types';
import { formatDates, generateNumbers, getErrorMessage } from '../lib/utils';

@Injectable({
    providedIn: 'root',
})
export class BlogService {
    blogs: WritableSignal<FetchState<Blog[]>> = signal<FetchState<Blog[]>>({
        isLoading: true,
        error: null,
        data: null,
    });
    mutateBlogsState: WritableSignal<FetchState<string>> = signal<FetchState<string>>({
        isLoading: false,
        error: null,
        data: null,
    });
    private http = inject(HttpClient);

    fetchBlogs(page: number = 1, limit: number = 10, filters: any = {}, onError?: ErrorFnCallback): void {
        this.blogs.set({ isLoading: true, error: null, data: { data: generateNumbers(limit) as unknown as Blog[] } });

        this.http.post<GenericResponse<Blog[]>>(API.GET_BLOGS, { ...filters }, {
            params: {
                page: page.toString(),
                limit: limit.toString()
            }
        }).subscribe({
            next: (response) => {
                this.blogs.set({
                    isLoading: false,
                    error: null,
                    data: {
                        ...response, data: response!.data?.map((blog, i) => ({
                            ...blog,
                            index: (page - 1) * limit + i + 1,
                            createdAt: formatDates(blog.createdAt),
                            updatedAt: formatDates(blog.updatedAt)
                        })) || []
                    }
                });
            },
            error: (error) => {
                this.blogs.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                onError?.(getErrorMessage(error));
            }
        });
    }

    createBlog(data: FormData, onSuccess?: Function, onError?: ErrorFnCallback) {
        this.mutateBlogsState.set({ isLoading: true, error: null, data: null });
        this.http.post<GenericResponse<string>>(API.CREATE_BLOG, data).subscribe({
            next: (response) => {
                this.mutateBlogsState.set({
                    isLoading: false,
                    error: null,
                    data: { message: response.message || '' }
                });
                onSuccess?.();
            },
            error: (error) => {
                this.mutateBlogsState.set({
                    isLoading: false,
                    error: getErrorMessage(error),
                    data: null,
                });
                onError?.(getErrorMessage(error));
            }
        });
    }
}
