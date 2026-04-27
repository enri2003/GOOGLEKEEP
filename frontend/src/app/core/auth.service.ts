import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { BasicService } from "../service/basic.service";
import { SessionService } from "../service/session.service";

export interface CurrentUser {
    id: number;
    name: string;
    email: string;
    fecha_nacimiento?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(BasicService);
    private readonly session = inject(SessionService);
    private readonly router = inject(Router);
    private validationPromise: Promise<boolean> | null = null;

    currentUser = signal<CurrentUser | null>(null);

    constructor() {
        const stored = this.session.get();
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data?.user) {
                    this.currentUser.set(this.normalizeUser(data.user));
                }
            } catch {}
        }
    }

    login(email: string, password: string) {
        return this.http.basePost('auth/login', { email, password });
    }

    register(data: { name: string; email: string; password: string; fecha_nacimiento?: string }) {
        return this.http.basePost('auth/register', data);
    }

    me() {
        return this.http.baseGet('auth/me');
    }

    saveSession(response: { token: string; user: any }) {
        const user = this.normalizeUser(response.user);
        this.session.save(JSON.stringify({ token: response.token, user }));
        this.currentUser.set(user);
    }

    async refreshSession(force = false): Promise<boolean> {
        const token = this.getToken();
        if (!token) {
            this.clearSession();
            return false;
        }

        if (!force && this.currentUser()) {
            return true;
        }

        if (!force && this.validationPromise) {
            return this.validationPromise;
        }

        this.validationPromise = firstValueFrom(this.me())
            .then((user) => {
                const normalized = this.normalizeUser(user);
                this.currentUser.set(normalized);
                this.session.save(JSON.stringify({ token, user: normalized }));
                return true;
            })
            .catch(() => {
                this.clearSession();
                return false;
            })
            .finally(() => {
                this.validationPromise = null;
            });

        return this.validationPromise;
    }

    logout(redirect = true) {
        this.clearSession();
        if (redirect) {
            this.router.navigate(['/auth/login']);
        }
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    hasToken(): boolean {
        const stored = this.session.get();
        if (!stored) return false;

        try {
            const data = JSON.parse(stored);
            return !!data?.token;
        } catch {
            return false;
        }
    }

    getToken(): string | null {
        const stored = this.session.get();
        if (!stored) return null;

        try {
            const data = JSON.parse(stored);
            return data?.token ?? null;
        } catch {
            return null;
        }
    }

    getUserInitial(): string {
        const user = this.currentUser();
        return user?.name?.charAt(0).toUpperCase() ?? 'U';
    }

    private clearSession() {
        this.currentUser.set(null);
        this.session.delete();
    }

    private normalizeUser(user: any): CurrentUser {
        return {
            id: Number(user?.id ?? user?.sub ?? 0),
            name: user?.name ?? 'Usuario',
            email: user?.email ?? '',
            fecha_nacimiento: user?.fecha_nacimiento ?? null,
            created_at: user?.created_at ?? null,
            updated_at: user?.updated_at ?? null,
        };
    }
}
