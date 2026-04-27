import { Routes } from '@angular/router';
import { guestGuard } from '@/app/core/guest.guard';
import { Access } from './access';
import { Error } from './error';
import { Login } from './login';
import { Register } from './register';

export default [
    { path: 'login', component: Login, canActivate: [guestGuard] },
    { path: 'register', component: Register, canActivate: [guestGuard] },
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: '**', redirectTo: 'login' },
] as Routes;
