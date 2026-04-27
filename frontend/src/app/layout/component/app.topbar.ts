import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/auth.service';
import { LayoutService } from '@/app/layout/service/layout.service';
import { NoteService } from '@/app/note/note.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, FormsModule],
    styles: [],
    template: `
    <div class="layout-topbar keep-topbar">
        <button
            class="menu-btn"
            [class.is-open]="menuOpen()"
            [attr.aria-expanded]="menuOpen()"
            aria-label="Alternar menu lateral"
            (click)="layoutService.onMenuToggle()"
        >
            <span class="hamburger" aria-hidden="true">
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
                <span class="hamburger-line"></span>
            </span>
        </button>

        <a class="logo-link" routerLink="/" title="Google Keep Clone">
            <div class="logo-circle">
                <i class="pi pi-lightbulb" style="color:white;font-size:15px"></i>
            </div>
        </a>

        <div class="search-wrap">
            <i class="pi pi-search search-icon"></i>
            <input
                type="text"
                [ngModel]="noteService.searchQuery()"
                (ngModelChange)="onSearch($event)"
                (keyup.escape)="clearSearch()"
                placeholder="Buscar notas..."
                class="search-input"
            />
        </div>

        <div class="topbar-actions">
            <button class="action-btn" title="Actualizar" (click)="refreshNotes()">
                <i class="pi pi-refresh" [class.spinning]="refreshing()"></i>
            </button>
            <button class="action-btn" title="Vista de cuadricula / lista">
                <i class="pi pi-th-large"></i>
            </button>
            <button class="action-btn" title="Configuracion">
                <i class="pi pi-cog"></i>
            </button>
            <button class="action-btn" title="Cerrar sesion" (click)="logout()">
                <i class="pi pi-sign-out"></i>
            </button>

            <button class="avatar-btn" type="button" title="Ver perfil" routerLink="/perfil">
                {{ authService.getUserInitial() }}
            </button>
        </div>
    </div>
    `
})
export class AppTopbar {
    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    noteService = inject(NoteService);
    refreshing = signal(false);
    menuOpen = computed(() => {
        const state = this.layoutService.layoutState();
        const config = this.layoutService.layoutConfig();

        if (!this.layoutService.isDesktop()) {
            return state.mobileMenuActive;
        }

        if (config.menuMode === 'overlay') {
            return state.overlayMenuActive;
        }

        return !state.staticMenuDesktopInactive;
    });

    onSearch(q: string) {
        this.noteService.searchQuery.set(q);
        this.noteService.load('notes');
    }

    clearSearch() {
        this.noteService.searchQuery.set('');
        this.noteService.load('notes');
    }

    refreshNotes() {
        this.refreshing.set(true);
        this.noteService.load(this.noteService.mode());
        setTimeout(() => this.refreshing.set(false), 600);
    }

    logout() {
        this.authService.logout();
    }
}
