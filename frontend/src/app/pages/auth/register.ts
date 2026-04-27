import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@/app/core/auth.service';
import { CommonModule } from '@angular/common';

const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordsMismatch: true } : null;
};

@Component({
    selector: 'app-register',
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
            position: absolute; border-radius: 50%;
            filter: blur(80px); pointer-events: none;
        }
        .orb-1 {
            width: 420px; height: 420px;
            background: radial-gradient(circle, rgba(251,188,4,0.1) 0%, transparent 70%);
            top: -120px; right: -80px;
        }
        .orb-2 {
            width: 320px; height: 320px;
            background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%);
            bottom: -60px; left: -60px;
        }
        .auth-card {
            width: 100%;
            max-width: 440px;
            background: rgba(255,255,255,0.04);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 20px;
            padding: 36px 36px 32px;
            box-shadow:
                0 24px 64px rgba(0,0,0,0.55),
                0 2px 0 rgba(255,255,255,0.06) inset;
            position: relative; z-index: 1;
        }
        .logo-ring {
            width: 58px; height: 58px; border-radius: 50%;
            background: linear-gradient(135deg, #FBBC04, #f59e0b);
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 14px;
            box-shadow: 0 4px 20px rgba(251,188,4,0.35), 0 0 0 7px rgba(251,188,4,0.07);
        }
        .auth-title {
            text-align: center; font-size: 26px; font-weight: 700;
            color: #ffffff; letter-spacing: -0.5px; margin-bottom: 4px;
        }
        .auth-subtitle {
            text-align: center; color: rgba(255,255,255,0.38);
            font-size: 13px; margin-bottom: 26px;
        }
        .field-label {
            display: block; color: rgba(255,255,255,0.55);
            font-size: 11px; font-weight: 600; letter-spacing: 0.6px;
            text-transform: uppercase; margin-bottom: 6px;
        }
        .field-wrap { position: relative; }
        .field-icon {
            position: absolute; left: 13px; top: 50%;
            transform: translateY(-50%);
            color: rgba(255,255,255,0.28); font-size: 13px; pointer-events: none;
        }
        .auth-input {
            width: 100%;
            padding: 12px 14px 12px 40px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.09);
            border-radius: 11px; color: #ffffff;
            font-size: 14px; outline: none;
            transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.18); }
        .auth-input:focus {
            border-color: rgba(251,188,4,0.45);
            box-shadow: 0 0 0 3px rgba(251,188,4,0.09);
            background: rgba(255,255,255,0.07);
        }
        .auth-input.error {
            border-color: rgba(248,113,113,0.5);
            box-shadow: 0 0 0 3px rgba(248,113,113,0.07);
        }
        .auth-input.success {
            border-color: rgba(74,222,128,0.45);
            box-shadow: 0 0 0 3px rgba(74,222,128,0.07);
        }
        .toggle-btn {
            position: absolute; right: 11px; top: 50%;
            transform: translateY(-50%);
            background: transparent; border: none; cursor: pointer;
            color: rgba(255,255,255,0.28); font-size: 13px;
            transition: color 0.15s;
        }
        .toggle-btn:hover { color: rgba(255,255,255,0.65); }
        .field-error {
            color: #f87171; font-size: 11px; margin-top: 4px;
            display: flex; align-items: center; gap: 4px;
        }
        .field-ok {
            color: #4ade80; font-size: 11px; margin-top: 4px;
            display: flex; align-items: center; gap: 4px;
        }

        /* Barra de fuerza de contraseña */
        .strength-bar-wrap {
            display: flex; gap: 4px; margin-top: 6px;
        }
        .strength-seg {
            height: 3px; flex: 1; border-radius: 2px;
            background: rgba(255,255,255,0.1);
            transition: background 0.3s;
        }
        .strength-label {
            font-size: 11px; margin-top: 4px;
            transition: color 0.3s;
        }

        .error-box {
            background: rgba(248,113,113,0.09);
            border: 1px solid rgba(248,113,113,0.22);
            border-radius: 10px; color: #f87171;
            font-size: 13px; padding: 10px 14px;
            margin-bottom: 16px;
            display: flex; align-items: center; gap: 8px;
        }
        .btn-submit {
            width: 100%; padding: 14px;
            background: linear-gradient(135deg, #FBBC04, #f59e0b);
            color: #1a1200; font-weight: 700; font-size: 15px;
            border: none; border-radius: 12px; cursor: pointer;
            letter-spacing: 0.3px;
            transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s;
            box-shadow: 0 4px 20px rgba(251,188,4,0.3);
        }
        .btn-submit:hover:not(:disabled) {
            opacity: 0.9; transform: translateY(-1px);
            box-shadow: 0 6px 24px rgba(251,188,4,0.42);
        }
        .btn-submit:disabled { opacity: 0.35; cursor: not-allowed; }
        .divider {
            display: flex; align-items: center; gap: 12px; margin: 22px 0;
        }
        .divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .divider-text { color: rgba(255,255,255,0.2); font-size: 12px; }
        .footer-link {
            text-align: center; color: rgba(255,255,255,0.35); font-size: 13px;
        }
        .footer-link a {
            color: #FBBC04; font-weight: 600; text-decoration: none;
        }
        .copy {
            text-align: center; color: rgba(255,255,255,0.14);
            font-size: 11px; margin-top: 20px; position: relative; z-index: 1;
        }
        .spinner {
            display: inline-block; width: 15px; height: 15px;
            border: 2px solid rgba(26,18,0,0.3); border-top-color: #1a1200;
            border-radius: 50%; animation: spin 0.7s linear infinite;
            vertical-align: middle; margin-right: 6px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .row-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media(max-width:480px) { .row-2col { grid-template-columns: 1fr; } }
        .mb { margin-bottom: 14px; }
    `],
    template: `
    <div class="auth-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>

        <div style="width:100%;max-width:440px;position:relative;z-index:1">
            <!-- Logo -->
            <div style="text-align:center;margin-bottom:24px">
                <div class="logo-ring">
                    <i class="pi pi-lightbulb" style="color:white;font-size:24px"></i>
                </div>
                <div class="auth-title">Crear cuenta</div>
                <div class="auth-subtitle">Únete a Keep y organiza tus ideas</div>
            </div>

            <div class="auth-card">
                <form [formGroup]="form" (ngSubmit)="submit()">

                    <!-- Nombre completo -->
                    <div class="mb">
                        <label class="field-label">Nombre completo</label>
                        <div class="field-wrap">
                            <i class="pi pi-user field-icon"></i>
                            <input type="text" formControlName="name"
                                   placeholder="Tu nombre completo"
                                   class="auth-input"
                                   [class.error]="form.get('name')?.invalid && form.get('name')?.touched"
                                   [class.success]="form.get('name')?.valid && form.get('name')?.touched" />
                        </div>
                        @if (form.get('name')?.invalid && form.get('name')?.touched) {
                            <div class="field-error"><i class="pi pi-exclamation-circle"></i> Mínimo 3 caracteres</div>
                        }
                    </div>

                    <!-- Email -->
                    <div class="mb">
                        <label class="field-label">Correo electrónico</label>
                        <div class="field-wrap">
                            <i class="pi pi-envelope field-icon"></i>
                            <input type="email" formControlName="email"
                                   placeholder="tu@email.com"
                                   class="auth-input"
                                   [class.error]="form.get('email')?.invalid && form.get('email')?.touched"
                                   [class.success]="form.get('email')?.valid && form.get('email')?.touched" />
                        </div>
                        @if (form.get('email')?.invalid && form.get('email')?.touched) {
                            <div class="field-error"><i class="pi pi-exclamation-circle"></i> Ingresa un email válido</div>
                        }
                    </div>

                    <!-- Contraseña -->
                    <div class="mb">
                        <label class="field-label">Contraseña</label>
                        <div class="field-wrap">
                            <i class="pi pi-lock field-icon"></i>
                            <input [type]="showPwd() ? 'text' : 'password'" formControlName="password"
                                   placeholder="Mínimo 6 caracteres"
                                   class="auth-input"
                                   [class.error]="form.get('password')?.invalid && form.get('password')?.touched"
                                   [class.success]="form.get('password')?.valid && form.get('password')?.touched"
                                   style="padding-right:42px" />
                            <button type="button" class="toggle-btn" (click)="showPwd.set(!showPwd())">
                                <i [class]="showPwd() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                            </button>
                        </div>
                        <!-- Barra de fuerza -->
                        @if (form.get('password')?.value) {
                            <div class="strength-bar-wrap">
                                <div class="strength-seg" [style.background]="strength().level >= 1 ? strength().color : ''"></div>
                                <div class="strength-seg" [style.background]="strength().level >= 2 ? strength().color : ''"></div>
                                <div class="strength-seg" [style.background]="strength().level >= 3 ? strength().color : ''"></div>
                            </div>
                            <div class="strength-label" [style.color]="strength().color">{{ strength().text }}</div>
                        }
                        @if (form.get('password')?.invalid && form.get('password')?.touched) {
                            <div class="field-error"><i class="pi pi-exclamation-circle"></i> Mínimo 6 caracteres</div>
                        }
                    </div>

                    <!-- Confirmar contraseña -->
                    <div class="mb">
                        <label class="field-label">Confirmar contraseña</label>
                        <div class="field-wrap">
                            <i class="pi pi-lock field-icon"></i>
                            <input [type]="showConfirm() ? 'text' : 'password'" formControlName="confirmPassword"
                                   placeholder="Repite tu contraseña"
                                   class="auth-input"
                                   [class.error]="form.errors?.['passwordsMismatch'] && form.get('confirmPassword')?.touched"
                                   [class.success]="!form.errors?.['passwordsMismatch'] && form.get('confirmPassword')?.value && form.get('confirmPassword')?.touched"
                                   style="padding-right:42px" />
                            <button type="button" class="toggle-btn" (click)="showConfirm.set(!showConfirm())">
                                <i [class]="showConfirm() ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
                            </button>
                        </div>
                        @if (form.errors?.['passwordsMismatch'] && form.get('confirmPassword')?.touched) {
                            <div class="field-error"><i class="pi pi-times-circle"></i> Las contraseñas no coinciden</div>
                        }
                        @if (!form.errors?.['passwordsMismatch'] && form.get('confirmPassword')?.value && form.get('confirmPassword')?.touched) {
                            <div class="field-ok"><i class="pi pi-check-circle"></i> Las contraseñas coinciden</div>
                        }
                    </div>

                    <!-- Fecha de nacimiento (opcional) -->
                    <div class="mb">
                        <label class="field-label">
                            Fecha de nacimiento
                            <span style="color:rgba(255,255,255,0.25);text-transform:none;font-weight:400;letter-spacing:0"> (opcional)</span>
                        </label>
                        <div class="field-wrap">
                            <i class="pi pi-calendar field-icon"></i>
                            <input type="date" formControlName="fecha_nacimiento"
                                   class="auth-input"
                                   style="padding-right:14px;color-scheme:dark" />
                        </div>
                    </div>

                    @if (errorMsg()) {
                        <div class="error-box">
                            <i class="pi pi-times-circle"></i> {{ errorMsg() }}
                        </div>
                    }

                    <button type="submit" class="btn-submit" [disabled]="form.invalid || loading()">
                        @if (loading()) { <span class="spinner"></span> }
                        @else { <i class="pi pi-user-plus" style="margin-right:6px"></i> }
                        Crear cuenta
                    </button>
                </form>

                <div class="divider">
                    <div class="divider-line"></div>
                    <span class="divider-text">o</span>
                    <div class="divider-line"></div>
                </div>

                <div class="footer-link">
                    ¿Ya tienes cuenta?
                    <a routerLink="/auth/login" style="margin-left:4px">Iniciar sesión</a>
                </div>
            </div>

            <div class="copy">Taller de Aplicaciones en Internet · 2026</div>
        </div>
    </div>
    `
})
export class Register {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);

    showPwd = signal(false);
    showConfirm = signal(false);
    loading = signal(false);
    errorMsg = signal('');

    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
        confirmPassword: ['', Validators.required],
        fecha_nacimiento: [''],
    }, { validators: passwordsMatchValidator });

    strength(): { level: number; text: string; color: string } {
        const pwd = this.form.get('password')?.value ?? '';
        if (!pwd) return { level: 0, text: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score++;
        if (pwd.length >= 10) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/\d/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        if (score <= 2) return { level: 1, text: 'Contraseña débil', color: '#f87171' };
        if (score <= 3) return { level: 2, text: 'Contraseña moderada', color: '#fb923c' };
        return { level: 3, text: 'Contraseña fuerte', color: '#4ade80' };
    }

    submit() {
        if (this.form.invalid) return;
        this.loading.set(true);
        this.errorMsg.set('');
        const { name, email, password, fecha_nacimiento } = this.form.value;
        const payload: any = { name, email, password };
        if (fecha_nacimiento) payload.fecha_nacimiento = fecha_nacimiento;

        this.authService.register(payload).subscribe({
            next: (res: any) => {
                this.authService.saveSession(res);
                this.router.navigate(['/']);
            },
            error: (err: any) => {
                this.errorMsg.set(err?.error?.message ?? 'Error al registrar usuario');
                this.loading.set(false);
            }
        });
    }
}
