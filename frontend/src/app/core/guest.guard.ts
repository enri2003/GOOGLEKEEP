import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "./auth.service";

export const guestGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasToken()) {
        return true;
    }

    const valid = await authService.refreshSession();
    if (valid) {
        router.navigate(['/']);
        return false;
    }

    return true;
};
