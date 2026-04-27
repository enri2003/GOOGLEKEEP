import { Routes } from '@angular/router';
import { authGuard } from './app/core/auth.guard';
import { AppLayout } from './app/layout/component/app.layout';
import { NoteListComponent } from './app/note/note-list/note-list.component';
import { Notfound } from './app/pages/notfound/notfound';
import { ProfileComponent } from './app/profile/profile.component';
import { UsuarioListComponent } from './app/usuario/usuario-list/usuario-list.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            { path: '', component: NoteListComponent, data: { mode: 'notes' } },
            { path: 'recordatorios', component: NoteListComponent, data: { mode: 'reminders' } },
            { path: 'etiquetas', component: NoteListComponent, data: { mode: 'notes' } },
            { path: 'archivo', component: NoteListComponent, data: { mode: 'archived' } },
            { path: 'papelera', component: NoteListComponent, data: { mode: 'trash' } },
            { path: 'perfil', component: ProfileComponent },
            { path: 'usuario', component: UsuarioListComponent },
        ]
    },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
