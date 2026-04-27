import { Component, EventEmitter, inject, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NoteService } from "../note.service";

@Component({
    selector: 'app-note-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="note-input-wrapper">
        @if (!expanded()) {
            <div class="input-collapsed" (click)="expand('text')">
                <span class="placeholder-text">Crear una nota...</span>
                <div class="input-icons">
                    <button type="button" class="icon-btn" title="Nueva lista"
                            (click)="$event.stopPropagation(); expand('checklist')">
                        <i class="pi pi-check-square"></i>
                    </button>
                    <button type="button" class="icon-btn" title="Nueva nota de texto"
                            (click)="$event.stopPropagation(); expand('text')">
                        <i class="pi pi-pencil"></i>
                    </button>
                    <input type="file" #fileInputHidden style="display: none" accept="image/*" (change)="onFileSelected($event)">
                    <button type="button" class="icon-btn" title="Nueva nota con imagen"
                            (click)="$event.stopPropagation(); fileInputHidden.click()">
                        <i class="pi pi-image"></i>
                    </button>
                </div>
            </div>
        } @else {
            <div class="input-expanded">
                @if (imageUrl) {
                    <div style="position: relative; width: 100%;">
                        <img [src]="imageUrl" style="width: 100%; max-height: 400px; object-fit: cover; display: block;" />
                        <button type="button" 
                                style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.5); color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;"
                                (click)="imageUrl = ''">
                            <i class="pi pi-times"></i>
                        </button>
                    </div>
                }

                <input type="text" [(ngModel)]="title" placeholder="Título"
                       class="input-title" autofocus />

                @if (type() === 'text') {
                    <textarea [(ngModel)]="content" placeholder="Crear una nota..."
                              class="input-textarea" rows="3"></textarea>
                } @else {
                    <div class="checklist-area">
                        @for (item of items; track $index) {
                            <div class="check-row">
                                <input type="checkbox" [(ngModel)]="item.checked"
                                       class="accent-amber-400" />
                                <input type="text" [(ngModel)]="item.text"
                                       placeholder="Elemento de la lista"
                                       class="check-input" />
                                <button type="button" class="remove-btn" (click)="removeItem($index)">
                                    <i class="pi pi-times"></i>
                                </button>
                            </div>
                        }
                        <button type="button" class="add-item-btn" (click)="addItem()">
                            <i class="pi pi-plus"></i> Elemento de la lista
                        </button>
                    </div>
                }

                @if (reminder || collaborators.length > 0) {
                    <div style="padding: 0 16px 8px; display: flex; flex-wrap: wrap; gap: 8px;">
                        @if (reminder) {
                            <span style="background: rgba(255,255,255,0.1); color: #FBBC04; padding: 4px 10px; border-radius: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px;">
                                <i class="pi pi-bell"></i> Recordatorio
                                <i class="pi pi-times" style="cursor:pointer" (click)="reminder = null"></i>
                            </span>
                        }
                        @for (email of collaborators; track email) {
                            <span style="background: rgba(255,255,255,0.1); color: #e8eaed; padding: 4px 10px; border-radius: 12px; font-size: 11px; display: inline-flex; align-items: center; gap: 5px;">
                                <i class="pi pi-user"></i> {{ email }}
                                <i class="pi pi-times" style="cursor:pointer" (click)="removeCollaborator(email)"></i>
                            </span>
                        }
                    </div>
                }

                <div class="input-footer">
                    <div class="footer-icons" style="position: relative;">
                        <button type="button" class="icon-btn-sm" title="Recordatorio" 
                                (click)="toggleReminder()"
                                [style.color]="reminder ? '#FBBC04' : ''">
                            <i class="pi pi-bell"></i>
                        </button>

                        <button type="button" class="icon-btn-sm" title="Colaborador" (click)="showShare = !showShare">
                            <i class="pi pi-user-plus"></i>
                        </button>

                        @if (showShare) {
                            <div style="position: absolute; bottom: 40px; left: 0; background: #3c3d40; padding: 12px; border-radius: 8px; z-index: 100; width: 250px; box-shadow: 0 8px 24px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.1);">
                                <input type="email" [(ngModel)]="shareEmail" placeholder="Correo del colaborador" 
                                       (keyup.enter)="addCollaborator()"
                                       style="width: 100%; background: #202124; border: 1px solid #5f6368; color: white; padding: 8px; border-radius: 4px; font-size: 12px; outline: none;">
                                <button type="button" (click)="addCollaborator()" 
                                        style="margin-top: 8px; width: 100%; background: #FBBC04; border: none; color: #1a1200; padding: 8px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 12px;">
                                    Añadir
                                </button>
                            </div>
                        }
                        
                        <input type="file" #fileInputExpanded style="display: none" accept="image/*" (change)="onFileSelected($event)">
                        <button type="button" class="icon-btn-sm" title="Imagen" (click)="fileInputExpanded.click()">
                            <i class="pi pi-image"></i>
                        </button>
                    </div>
                    <div class="footer-actions">
                        <button type="button" class="btn-cancel" (click)="cancel()">Cancelar</button>
                        <button type="button" class="btn-save" (click)="save()">Guardar</button>
                    </div>
                </div>
            </div>
        }
    </div>
    `,
    styles: [`
        .note-input-wrapper { width: 100%; }
        .input-collapsed {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 20px; border-radius: 12px; cursor: text;
            background: linear-gradient(135deg, rgba(40,41,44,0.8) 0%, rgba(40,41,44,0.6) 100%);
            border: 1px solid rgba(251,188,4,0.15);
            box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: blur(12px);
        }
        .input-collapsed:hover {
            box-shadow: 0 8px 24px rgba(251,188,4,0.15), inset 0 1px 0 rgba(255,255,255,0.1);
            border-color: rgba(251,188,4,0.35);
            background: linear-gradient(135deg, rgba(42,43,48,0.9) 0%, rgba(40,41,44,0.7) 100%);
        }
        .placeholder-text { color: rgba(255,255,255,0.45); font-size: 14px; font-weight: 500; letter-spacing: 0.2px; }
        .input-icons { display: flex; gap: 4px; }
        .icon-btn {
            color: #9aa0a6; font-size: 15px; padding: 7px 8px;
            border-radius: 50%; background: transparent; border: none; cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .icon-btn:hover { color: #e8eaed; background: rgba(251,188,4,0.1); }
        .input-expanded {
            border-radius: 12px; overflow: hidden;
            background: linear-gradient(135deg, #28292c 0%, #2a2b30 100%);
            border: 1px solid rgba(251,188,4,0.2);
            box-shadow: 0 12px 48px rgba(0,0,0,0.5), 0 0 1px rgba(251,188,4,0.3) inset;
        }
        .input-title {
            display: block; width: 100%; background: transparent; border: none; border-bottom: 1px solid #3c3d40;
            color: #e8eaed; font-size: 14px; font-weight: 600; padding: 14px 16px; outline: none;
        }
        .input-title::placeholder { color: #5f6368; }
        .input-textarea {
            display: block; width: 100%; background: transparent; border: none; resize: none;
            color: #e8eaed; font-size: 13px; line-height: 1.6; padding: 12px 16px; outline: none; min-height: 80px;
        }
        .input-textarea::placeholder { color: #5f6368; }
        .checklist-area { padding: 12px 16px; }
        .check-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .check-input { flex: 1; background: transparent; border: none; border-bottom: 1px solid #3c3d40; color: #e8eaed; font-size: 13px; padding: 4px 0; outline: none; }
        .check-input::placeholder { color: #5f6368; }
        .remove-btn { color: #5f6368; background: transparent; border: none; cursor: pointer; padding: 2px 4px; border-radius: 4px; font-size: 11px; }
        .remove-btn:hover { color: #9aa0a6; }
        .add-item-btn { display: flex; align-items: center; gap: 6px; color: #5f6368; background: transparent; border: none; cursor: pointer; font-size: 13px; padding: 4px 0; margin-top: 4px; }
        .add-item-btn:hover { color: #9aa0a6; }
        .input-footer { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-top: 1px solid rgba(255,255,255,0.06); }
        .footer-icons { display: flex; gap: 2px; }
        .icon-btn-sm { color: rgba(255,255,255,0.5); font-size: 13px; padding: 6px 7px; border-radius: 50%; background: transparent; border: none; cursor: pointer; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .icon-btn-sm:hover { color: #e8eaed; background: rgba(251,188,4,0.12); }
        .footer-actions { display: flex; gap: 8px; align-items: center; }
        .btn-cancel { color: rgba(255,255,255,0.55); background: transparent; border: none; cursor: pointer; font-size: 13px; padding: 7px 16px; border-radius: 8px; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); font-weight: 500; }
        .btn-cancel:hover { background: rgba(255,255,255,0.08); color: #e8eaed; }
        .btn-save { color: #1a1200; background: linear-gradient(135deg, #FBBC04, #fcc934); border: none; cursor: pointer; font-size: 13px; font-weight: 700; padding: 8px 20px; border-radius: 8px; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 4px 12px rgba(251,188,4,0.25); letter-spacing: 0.3px; }
        .btn-save:hover { background: linear-gradient(135deg, #fcc934, #ffd966); box-shadow: 0 8px 20px rgba(251,188,4,0.35); transform: translateY(-2px); }
    `]
})
export class NoteInputComponent {
    private readonly noteService = inject(NoteService);
    @Output() saved = new EventEmitter<void>();

    expanded = signal(false);
    type = signal<'text' | 'checklist'>('text');
    title = '';
    content = '';
    imageUrl = '';
    reminder: Date | null = null;
    items: { text: string; checked: boolean }[] = [];
    
    showShare = false;
    shareEmail = '';
    collaborators: string[] = [];

    expand(t: 'text' | 'checklist') {
        this.type.set(t);
        this.expanded.set(true);
        if (t === 'checklist' && this.items.length === 0) {
            this.items = [{ text: '', checked: false }];
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.imageUrl = reader.result as string;
                this.expanded.set(true);
            };
            reader.readAsDataURL(file);
        }
    }

    toggleReminder() {
        this.reminder = this.reminder ? null : new Date();
    }

    addCollaborator() {
        if (this.shareEmail.trim() && !this.collaborators.includes(this.shareEmail)) {
            this.collaborators.push(this.shareEmail.trim());
            this.shareEmail = '';
            this.showShare = false;
        }
    }

    removeCollaborator(email: string) {
        this.collaborators = this.collaborators.filter(e => e !== email);
    }

    addItem() { this.items.push({ text: '', checked: false }); }
    removeItem(i: number) { this.items.splice(i, 1); }

    save() {
        // Validación: Solo cancela si ABSOLUTAMENTE todo está vacío
        const hasChecklistContent = this.type() === 'checklist' && this.items.some(i => i.text.trim());
        if (!this.title.trim() && !this.content.trim() && !this.imageUrl && !hasChecklistContent) {
            this.cancel();
            return;
        }

        const dto: any = {
            title: this.title || '',
            type: this.type(),
            content: this.type() === 'text' ? (this.content || '') : '',
            image_url: this.imageUrl || null,
            reminder: this.reminder || null,
            items: this.type() === 'checklist' ? this.items.filter(i => i.text.trim()) : null,
            collaborators: this.collaborators.length > 0 ? this.collaborators : []
        };

        this.noteService.create(dto).subscribe({
            next: () => { 
                this.saved.emit(); 
                this.cancel(); 
            },
            error: (err) => console.error("Error al guardar:", err)
        });
    }

    cancel() {
        this.expanded.set(false);
        this.title = '';
        this.content = '';
        this.imageUrl = '';
        this.reminder = null;
        this.items = [];
        this.collaborators = [];
        this.showShare = false;
        this.shareEmail = '';
    }
}