import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, map, Observable, of, throwError } from "rxjs";

@Injectable({providedIn: 'root'})
export class BasicService {
    private readonly serviceHttp = inject(HttpClient);
    private readonly baseUrl = BasicService.resolveApiUrl();

    private static resolveApiUrl(): string {
        const host = globalThis.location?.hostname ?? 'localhost';
        if (host === 'localhost' || host === '127.0.0.1') {
            return 'http://localhost:3000/api/v1';
        }
        // Túnel de VS Code para el backend (puerto 3000)
        return 'https://fnx3dsc4-3000.brs.devtunnels.ms/api/v1';
    }

    baseGet(methodUrl: string): Observable<any> {
        return this.serviceHttp
            .get(`${this.baseUrl}/${methodUrl}`, { observe: 'response' })
            .pipe(
                map((response: HttpResponse<any>) => response.body),
                catchError((error: HttpErrorResponse) => throwError(() => error))
            );
    }

    basePost(methodUrl: string, data: any): Observable<any> {
        return this.serviceHttp
            .post(`${this.baseUrl}/${methodUrl}`, data, { observe: 'response' })
            .pipe(
                map((response: HttpResponse<any>) => response.body),
                catchError((error: HttpErrorResponse) => {
                    if (error.status >= 200 && error.status < 300) {
                        const fallbackBody = (error.error as { text?: string })?.text ?? error.error ?? null;
                        return of(fallbackBody);
                    }
                    return throwError(() => error);
                })
            );
    }

    basePatch(methodUrl: string, data: any): Observable<any> {
        return this.serviceHttp
            .patch(`${this.baseUrl}/${methodUrl}`, data, { observe: 'response' })
            .pipe(
                map((response: HttpResponse<any>) => response.body),
                catchError((error: HttpErrorResponse) => throwError(() => error))
            );
    }

    baseDelete(methodUrl: string): Observable<any> {
        return this.serviceHttp
            .delete(`${this.baseUrl}/${methodUrl}`, { observe: 'response' })
            .pipe(
                map((response: HttpResponse<any>) => response.body),
                catchError((error: HttpErrorResponse) => throwError(() => error))
            );
    }
}