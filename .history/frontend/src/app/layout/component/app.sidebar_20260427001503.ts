import { CommonModule } from '@angular/common';
import { Component, computed, effect, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/auth.service';
import { AppMenu } from './app.menu';
import { LayoutService } from '@/app/layout/service/layout.service';
import { NoteService } from '@/app/note/note.service';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [AppMenu, RouterModule, CommonModule],
    host: {
        '[class.sidebar-open]': 'isSidebarVisible()'
    },
    styles: [],
    template: `
    <!-- Panel Keep eliminado -->
    `
})
export class AppSidebar implements OnInit, OnDestroy {
    layoutService = inject(LayoutService);
    authService = inject(AuthService);
    noteService = inject(NoteService);
    router = inject(Router);
    el = inject(ElementRef);

    isSidebarVisible = computed(() => {
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

    private outsideClickListener: ((event: MouseEvent) => void) | null = null;
    private readonly destroy$ = new Subject<void>();

    constructor() {
        effect(() => {
            const state = this.layoutService.layoutState();
            const active = this.layoutService.isDesktop()
                ? state.overlayMenuActive
                : state.mobileMenuActive;

            if (active) {
                this.bindOutsideClickListener();
            } else {
                this.unbindOutsideClickListener();
            }
        });
    }

    ngOnInit() {
        this.router.events
            .pipe(filter((event) => event instanceof NavigationEnd), takeUntil(this.destroy$))
            .subscribe((event) => this.onRouteChange(event.urlAfterRedirects));

        this.onRouteChange(this.router.url);
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.unbindOutsideClickListener();
    }

    userName() {
        const user = this.authService.currentUser();
        return user?.name ?? 'Usuario';
    }

    userEmail() {
        const user = this.authService.currentUser();
        return user?.email ?? '';
    }

    logout() {
        this.authService.logout();
    }

    openProfile() {
        this.router.navigate(['/perfil']);
    }

    private onRouteChange(path: string | undefined) {
        this.layoutService.layoutState.update((value) => ({
            ...value,
            activePath: path ?? null,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            mobileMenuActive: false,
            menuHoverActive: false
        }));
    }

    private bindOutsideClickListener() {
        if (!this.outsideClickListener) {
            this.outsideClickListener = (event: MouseEvent) => {
                if (this.isOutsideClicked(event)) {
                    this.layoutService.layoutState.update((value) => ({
                        ...value,
                        overlayMenuActive: false,
                        staticMenuMobileActive: false,
                        mobileMenuActive: false,
                        menuHoverActive: false
                    }));
                }
            };

            document.addEventListener('click', this.outsideClickListener);
        }
    }

    private unbindOutsideClickListener() {
        if (this.outsideClickListener) {
            document.removeEventListener('click', this.outsideClickListener);
            this.outsideClickListener = null;
        }
    }

    private isOutsideClicked(event: MouseEvent): boolean {
        const topbarBtn = document.querySelector('.menu-btn');
        const sidebarEl = this.el.nativeElement;

        return !(
            sidebarEl?.isSameNode(event.target as Node) ||
            sidebarEl?.contains(event.target as Node) ||
            topbarBtn?.isSameNode(event.target as Node) ||
            topbarBtn?.contains(event.target as Node)
        );
    }
}
