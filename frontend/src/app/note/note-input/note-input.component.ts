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
            <!-- Barra colapsada -->
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
                    <button type="button" class="icon-btn" title="Nueva nota con imagen">
                        <i class="pi pi-image"></i>
                    </button>
                </div>
            </div>
        } @else {
            <!-- Formulario expandido -->
            <div class="input-expanded">
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

                <div class="input-footer">
                    <div class="footer-icons">
                        <button type="button" class="icon-btn-sm" title="Recordatorio"><i class="pi pi-bell"></i></button>
                        <button type="button" class="icon-btn-sm" title="Colaborador"><i class="pi pi-user-plus"></i></button>
                        <button type="button" class="icon-btn-sm" title="Imagen"><i class="pi pi-image"></i></button>
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
        .note-input-wrapper {
            width: 100%;
        }
        .input-collapsed {
            display: flex; align-items: center; justify-content: space-between;
            padding: 14px 20px; border-radius: 12px; cursor: text;
            background: linear-gradient(135deg, rgba(40,41,44,0.8) 0%, rgba(40,41,44,0.6) 100%);
            border: 1px solid rgba(251,188,4,0.15);
            box-shadow: 
                0 2px 8px rgba(0,0,0,0.3),
                inset 0 1px 0 rgba(255,255,255,0.05);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            backdrop-filter: blur(12px);
        }
        .input-collapsed:hover {
            box-shadow: 
                0 8px 24px rgba(251,188,4,0.15),
                inset 0 1px 0 rgba(255,255,255,0.1);
            border-color: rgba(251,188,4,0.35);
            background: linear-gradient(135deg, rgba(42,43,48,0.9) 0%, rgba(40,41,44,0.7) 100%);
        }
        .placeholder-text { 
            color: rgba(255,255,255,0.45); font-size: 14px; font-weight: 500;
            letter-spacing: 0.2px;
        }
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
            box-shadow: 
                0 12px 48px rgba(0,0,0,0.5),
                0 0 1px rgba(251,188,4,0.3) inset;
        }
        .input-title {
            display: block; width: 100%;
            background: transparent; border: none; border-bottom: 1px solid #3c3d40;
            color: #e8eaed; font-size: 14px; font-weight: 600;
            padding: 14px 16px; outline: none;
        }
        .input-title::placeholder { color: #5f6368; }
        .input-textarea {
            display: block; width: 100%;
            background: transparent; border: none; resize: none;
            color: #e8eaed; font-size: 13px; line-height: 1.6;
            padding: 12px 16px; outline: none; min-height: 80px;
        }
        .input-textarea::placeholder { color: #5f6368; }

        .checklist-area { padding: 12px 16px; }
        .check-row {
            display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
        }
        .check-input {
            flex: 1; background: transparent; border: none; border-bottom: 1px solid #3c3d40;
            color: #e8eaed; font-size: 13px; padding: 4px 0; outline: none;
        }
        .check-input::placeholder { color: #5f6368; }
        .remove-btn {
            color: #5f6368; background: transparent; border: none; cursor: pointer;
            padding: 2px 4px; border-radius: 4px; font-size: 11px;
        }
        .remove-btn:hover { color: #9aa0a6; }
        .add-item-btn {
            display: flex; align-items: center; gap: 6px;
            color: #5f6368; background: transparent; border: none; cursor: pointer;
            font-size: 13px; padding: 4px 0; margin-top: 4px;
        }
        .add-item-btn:hover { color: #9aa0a6; }

        .input-footer {
            display: flex; align-items: center; justify-content: space-between;
            padding: 8px 12px; border-top: 1px solid rgba(255,255,255,0.06);
        }
        .footer-icons { display: flex; gap: 2px; }
        .icon-btn-sm {
            color: rgba(255,255,255,0.5); font-size: 13px; padding: 6px 7px;
            border-radius: 50%; background: transparent; border: none; cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .icon-btn-sm:hover { color: #e8eaed; background: rgba(251,188,4,0.12); }
        .footer-actions { display: flex; gap: 8px; align-items: center; }
        .btn-cancel {
            color: rgba(255,255,255,0.55); background: transparent; border: none; cursor: pointer;
            font-size: 13px; padding: 7px 16px; border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            font-weight: 500;
        }
        .btn-cancel:hover { background: rgba(255,255,255,0.08); color: #e8eaed; }
        .btn-save {
            color: #1a1200; background: linear-gradient(135deg, #FBBC04, #fcc934);
            border: none; cursor: pointer; font-size: 13px; font-weight: 700;
            padding: 8px 20px; border-radius: 8px;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            box-shadow: 0 4px 12px rgba(251,188,4,0.25);
            letter-spacing: 0.3px;
        }
        .btn-save:hover {
            background: linear-gradient(135deg, #fcc934, #ffd966);
            box-shadow: 0 8px 20px rgba(251,188,4,0.35);
            transform: translateY(-2px);
        }
    `]
})
export class NoteInputComponent {
    private readonly noteService = inject(NoteService);
    @Output() saved = new EventEmitter<void>();

    expanded = signal(false);
    type = signal<'text' | 'checklist'>('text');
    title = '';
    content = '';
    items: { text: string; checked: boolean }[] = [];

    expand(t: 'text' | 'checklist') {
        this.type.set(t);
        this.expanded.set(true);
        if (t === 'checklist' && this.items.length === 0) {
            this.items = [{ text: '', checked: false }];
        }
    }

    addItem() { this.items.push({ text: '', checked: false }); }
    removeItem(i: number) { this.items.splice(i, 1); }

    save() {
        if (!this.title && !this.content && this.items.every(i => !i.text)) {
            this.cancel();
            return;
        }
        const dto: any = {
            title: this.title,
            type: this.type(),
            content: this.type() === 'text' ? this.content : '',
            items: this.type() === 'checklist' ? this.items.filter(i => i.text) : null,
        };
        this.noteService.create(dto).subscribe({
            next: () => { this.saved.emit(); this.cancel(); }
        });
    }

    cancel() {
        this.expanded.set(false);
        this.title = '';
        this.content = '';
        this.items = [];
    }
}
