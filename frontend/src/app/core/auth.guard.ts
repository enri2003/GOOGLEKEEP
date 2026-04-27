import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasToken()) {
        router.navigate(['/auth/login']);
        return false;
    }

    const valid = await authService.refreshSession();
    if (valid) {
        return true;
    }

    router.navigate(['/auth/login']);
    return false;
};
