import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule, RouterModule, CommonModule],
    styles: [`
        .auth-bg {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            background: linear-gradient(135deg, #0d0e1a 0%, #1a1b2e 30%, #0f1e35 60%, #131020 100%);
            position: relative;
            overflow: hidden;
        }
        .orb {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            pointer-events: none;
        }
        .orb-1 {
            width: 400px; height: 400px;
            background: radial-gradient(circle, rgba(251,188,4,0.12) 0%, transparent 70%);
            top: -100px; right: -100px;
        }
        .orb-2 {
            width: 350px; height: 350px;
            background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
            bottom: -80px; left: -80px;
        }
        .orb-3 {
            width: 200px; height: 200px;
            background: radial-gradient(circle, rgba(251,188,4,0.08) 0%, transparent 70%);
            top: 50%; left: 30%;
        }
        .auth-card {
            width: 100%;
            max-width: 420px;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 20px;
            padding: 40px 36px;
            box-shadow:
                0 24px 64px rgba(0,0,0,0.55),
                0 2px 0 rgba(255,255,255,0.06) inset,
                0 0 0 1px rgba(255,255,255,0.04);
            position: relative;
            z-index: 1;
        }
        .logo-ring {
            width: 64px; height: 64px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FBBC04, #f59e0b);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 16px;
            box-shadow: 0 4px 24px rgba(251,188,4,0.4), 0 0 0 8px rgba(251,188,4,0.08);
        }
        .auth-title {
            text-align: center;
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.5px;
            margin-bottom: 4px;
        }
        .auth-subtitle {
            text-align: center;
            color: rgba(255,255,255,0.4);
            font-size: 13px;
            margin-bottom: 28px;
        }
        .field-label {
            display: block;
            color: rgba(255,255,255,0.6);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 7px;
        }
        .field-wrap {
            position: relative;
            margin-bottom: 18px;
        }
        .field-icon {
            position: absolute;
            left: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.3);
            font-size: 14px;
            pointer-events: none;
        }
        .auth-input {
            width: 100%;
            padding: 13px 14px 13px 42px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
            border-color: rgba(251,188,4,0.5);
            box-shadow: 0 0 0 3px rgba(251,188,4,0.1);
            background: rgba(255,255,255,0.08);
        }
        .auth-input.error {
            border-color: rgba(248,113,113,0.5);
            box-shadow: 0 0 0 3px rgba(248,113,113,0.08);
        }
        .auth-input.pr-icon { padding-right: 42px; }
        .toggle-btn {
            position: absolute; right: 12px; top: 50%;
            transform: translateY(-50%);
            background: transparent; border: none; cursor: pointer;
            color: rgba(255,255,255,0.3); font-size: 14px;
            transition: color 0.15s;
        }
        .toggle-btn:hover { color: rgba(255,255,255,0.7); }
        .field-error {
            color: #f87171; font-size: 11px; margin-top: 5px;
            display: flex; align-items: center; gap: 4px;
        }
        .forgot-link {
            text-align: right; margin-bottom: 20px;
        }
        .forgot-link span {
            color: #FBBC04; font-size: 12px; cursor: pointer;
            opacity: 0.8; transition: opacity 0.15s;
        }
        .forgot-link span:hover { opacity: 1; }
        .error-box {
            background: rgba(248,113,113,0.1);
            border: 1px solid rgba(248,113,113,0.25);
            border-radius: 10px;
            color: #f87171;
            font-size: 13px;
            padding: 10px 14px;
            margin-bottom: 18px;
            display: flex; align-items: center; gap: 8px;
        }
        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #FBBC04, #f59e0b);
            color: #1a1200;
            font-weight: 700;
            font-size: 15px;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            letter-spacing: 0.3px;
            transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
            box-shadow: 0 4px 20px rgba(251,188,4,0.35);
        }
        .btn-submit:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 6px 24px rgba(251,188,4,0.45);
        }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .divider {
            display: flex; align-items: center; gap: 12px;
            margin: 24px 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { color: rgba(255,255,255,0.2); font-size: 12px; }
        .footer-link {
            text-align: center;
            color: rgba(255,255,255,0.35);
            font-size: 13px;
        }
        .footer-link a {
            color: #FBBC04; font-weight: 600; text-decoration: none;
            transition: opacity 0.15s;
        }
        .footer-link a:hover { opacity: 0.8; }
        .copy {
            text-align: center; color: rgba(255,255,255,0.15);
            font-size: 11px; margin-top: 24px; position: relative; z-index: 1;
        }
        .spinner {
            display: inline-block; width: 16px; height: 16px;
            border: 2px solid rgba(26,18,0,0.3);
            border-top-color: #1a1200;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
            vertical-align: middle; margin-right: 6px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    `],
    template: `
    <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>

        <div style="width:100%;max-width:420px;position:relative;z-index:1">
            <!-- Logo -->
            <div style="text-align:center;margin-bottom:28px">
                <div class="logo-ring">
                    <i class="pi pi-lightbulb" style="color:white;font-size:26px"></i>
                </div>
                <div class="auth-title">Keep</div>
                <div class="auth-subtitle">Inicia sesión en tu cuenta</div>
            </div>

            <div class="auth-card">
                <form [formGroup]="form" (ngSubmit)="submit()">

                    <!-- Email -->
                    <div>
                        <label class="field-label">Correo electrónico</label>
                        <div class="field-wrap">
                            <i class="pi pi-envelope field-icon"></i>
                            <input type="email" formControlName="email"
                                   placeholder="tu@email.com"
                                   class="auth-input pr-icon"
                                   [class.error]="form.get('email')?.invalid && form.get('email')?.touched" />
                        </div>
                        @if (form.get('email')?.invalid && form.get('email')?.touched) {
                            <div class="field-error">
                                <i class="pi pi-exclamation-circle"></i> Ingresa un email válido
                            </div>
                        }
                    </div>

                    <!-- Password -->
                    <div style="margin-top:16px">
                        <label class="field-label">Contraseña</label>
                        <div class="field-wrap">
                            <i class="pi pi-lock field-icon"></i>
                            <input [type]="showPwd() ? 'text' : 'password'" formControlName="password"
                                   placeholder="••••••••"
                                   class="auth-input pr-icon"
                                   [class.error]="form.get('password')?.invalid && form.get('password')?.touched"
                                   style="padding-right:44px" />
                            <button type="button" class="toggle-btn" (click)="showPwd.set(!showPwd())">
                                <i [class]="showPwd() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                            </button>
                        </div>
                        @if (form.get('password')?.invalid && form.get('password')?.touched) {
                            <div class="field-error">
                                <i class="pi pi-exclamation-circle"></i> Mínimo 6 caracteres
                            </div>
                        }
                    </div>

                    <div class="forgot-link" style="margin-top:10px">
                        <span>¿Olvidaste tu contraseña?</span>
                    </div>

                    @if (errorMsg()) {
                        <div class="error-box">
                            <i class="pi pi-times-circle"></i> {{ errorMsg() }}
                        </div>
                    }

                    <button type="submit" class="btn-submit" [disabled]="form.invalid || loading()">
                        @if (loading()) { <span class="spinner"></span> }
                        @else { <i class="pi pi-sign-in" style="margin-right:6px"></i> }
                        Iniciar sesión
                    </button>
                </form>

                <div class="divider">
                    <div class="divider-line"></div>
                    <span class="divider-text">o</span>
                    <div class="divider-line"></div>
                </div>

                <div class="footer-link">
                    ¿No tienes cuenta?
                    <a routerLink="/auth/register" style="margin-left:4px">Crear cuenta</a>
                </div>
            </div>

            <div class="copy">Taller de Aplicaciones en Internet · 2026</div>
        </div>
    </div>
    `
})
export class Login {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    showPwd = signal(false);
    loading = signal(false);
    errorMsg = signal('');

    form = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
    });

    submit() {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.errorMsg.set('');
        const { email, password } = this.form.value;
        this.authService.login(email!, password!).subscribe({
            next: (res: any) => {
                this.authService.saveSession(res);
                this.router.navigate(['/']);
            },
            error: (err: any) => {
                this.errorMsg.set(err?.error?.message ?? 'Credenciales incorrectas');
                this.loading.set(false);
            }
        });
    }
}
