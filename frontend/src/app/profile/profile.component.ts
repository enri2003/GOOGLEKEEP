import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/auth.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, RouterModule],
    styles: [`
        .profile-page {
            min-height: calc(100vh - 8rem);
            padding: 1.5rem 0 2rem;
        }

        .profile-shell {
            max-width: 880px;
            margin: 0 auto;
            display: grid;
            gap: 1rem;
        }

        .profile-hero,
        .profile-card {
            border-radius: 24px;
            border: 1px solid rgba(255,255,255,0.06);
            background: linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
            box-shadow: 0 20px 48px rgba(0,0,0,0.18);
            overflow: hidden;
        }

        .profile-hero {
            padding: 1.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .profile-avatar {
            width: 76px;
            height: 76px;
            border-radius: 24px;
            background: linear-gradient(135deg, #fbbc04 0%, #f59e0b 100%);
            color: #1a1200;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            font-weight: 800;
            box-shadow: 0 14px 28px rgba(251,188,4,0.24);
            flex-shrink: 0;
        }

        .profile-copy h1 {
            margin: 0 0 0.25rem;
            color: #fff;
            font-size: 1.9rem;
        }

        .profile-copy p {
            margin: 0;
            color: rgba(255,255,255,0.56);
        }

        .profile-chip {
            margin-top: 0.85rem;
            display: inline-flex;
            align-items: center;
            gap: 0.45rem;
            padding: 0.4rem 0.8rem;
            border-radius: 999px;
            background: rgba(251,188,4,0.12);
            color: #ffeb9f;
            font-size: 0.85rem;
            font-weight: 600;
        }

        .profile-card {
            padding: 1.25rem;
        }

        .profile-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 0.9rem;
        }

        .profile-item {
            padding: 1rem;
            border-radius: 18px;
            background: rgba(255,255,255,0.025);
            border: 1px solid rgba(255,255,255,0.04);
        }

        .profile-label {
            font-size: 0.78rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(255,255,255,0.38);
            margin-bottom: 0.45rem;
        }

        .profile-value {
            color: rgba(255,255,255,0.92);
            font-size: 1rem;
            word-break: break-word;
        }

        .profile-actions {
            display: flex;
            gap: 0.75rem;
            margin-top: 1rem;
            flex-wrap: wrap;
        }

        .profile-btn {
            border: none;
            border-radius: 14px;
            padding: 0.9rem 1rem;
            cursor: pointer;
            font-weight: 700;
            transition: transform 0.18s ease, opacity 0.18s ease;
            text-decoration: none;
        }

        .profile-btn:hover {
            transform: translateY(-1px);
            opacity: 0.92;
        }

        .profile-btn.primary {
            background: linear-gradient(135deg, #fbbc04 0%, #f59e0b 100%);
            color: #1a1200;
        }

        .profile-btn.ghost {
            background: rgba(255,255,255,0.06);
            color: rgba(255,255,255,0.88);
            border: 1px solid rgba(255,255,255,0.08);
        }
    `],
    template: `
    <section class="profile-page">
        <div class="profile-shell">
            <div class="profile-hero">
                <div class="profile-avatar">{{ authService.getUserInitial() }}</div>
                <div class="profile-copy">
                    <h1>{{ user()?.name || 'Usuario' }}</h1>
                    <p>Sesion iniciada con {{ user()?.email || 'sin correo' }}</p>
                    <div class="profile-chip">
                        <i class="pi pi-verified"></i>
                        Perfil autenticado
                    </div>
                </div>
            </div>

            <div class="profile-card">
                <div class="profile-grid">
                    <div class="profile-item">
                        <div class="profile-label">Nombre</div>
                        <div class="profile-value">{{ user()?.name || 'No disponible' }}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-label">Correo</div>
                        <div class="profile-value">{{ user()?.email || 'No disponible' }}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-label">ID</div>
                        <div class="profile-value">{{ user()?.id || 'No disponible' }}</div>
                    </div>
                    <div class="profile-item">
                        <div class="profile-label">Miembro desde</div>
                        <div class="profile-value">{{ createdAt() }}</div>
                    </div>
                </div>

                <div class="profile-actions">
                    <a routerLink="/" class="profile-btn ghost">Volver a notas</a>
                    <button type="button" class="profile-btn primary" (click)="logout()">Cerrar sesion</button>
                </div>
            </div>
        </div>
    </section>
    `
})
export class ProfileComponent {
    authService = inject(AuthService);

    user = this.authService.currentUser;
    createdAt = computed(() => {
        const value = this.user()?.created_at;
        if (!value) return 'No disponible';

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 'No disponible';

        return new Intl.DateTimeFormat('es-BO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    });

    logout() {
        this.authService.logout();
    }
}
