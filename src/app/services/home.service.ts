import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { FetchState, GenericResponse, HomeData } from "../lib/types";
import { API } from "../lib/constants";

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    homeData = signal<FetchState<HomeData>>({
        data: null,
        isLoading: false,
        error: null
    });

    http = inject(HttpClient);

    getHomeData() {
        this.homeData.set({
            data: null,
            isLoading: true,
            error: null
        });
        this.http.post<GenericResponse<HomeData>>(API.HOME, {}).subscribe({
            next: (res) => {
                this.homeData.set({
                    data: res,
                    isLoading: false,
                    error: null
                });
            },
            error: (err) => {
                this.homeData.set({
                    data: null,
                    isLoading: false,
                    error: err
                });
            }
        })
    }
}