import { Component, EventEmitter, inject, Input, Output, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Note, getNoteBackground } from "../shared/note.model";
import { NoteService } from "../note.service";

@Component({
    selector: 'app-note-card',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="note-card"
         [style.background]="noteBg()"
         [style.background-image]="note.background_image ? 'url(' + note.background_image + ')' : 'none'"
         [class.hovered]="hovered()"
         (click)="onCardClick($event)"
         (mouseenter)="hovered.set(true)"
         (mouseleave)="hovered.set(false)">

        <div class="select-check" (click)="$event.stopPropagation()">
            <div class="check-circle" [class.checked]="selected" (click)="selected = !selected">
                @if (selected) { <i class="pi pi-check" style="font-size:10px;color:white"></i> }
            </div>
        </div>

        <button type="button" class="pin-btn" title="Fijar"
                [class.is-pinned]="note.pinned"
                (click)="$event.stopPropagation(); pin()">
            <i class="pi pi-thumbtack"></i>
        </button>

        @if (note.image_url) {
            <img [src]="note.image_url" alt="" class="note-img" />
        }

        @if (note.title) {
            <div class="note-title">{{ note.title }}</div>
        }

        @if (note.type === 'text' && note.content) {
            <div class="note-content">{{ note.content }}</div>
        }

        @if (note.type === 'checklist' && note.items?.length) {
            <div class="note-checklist" (click)="$event.stopPropagation()">
                @for (item of (note.items ?? []); track $index) {
                    <div class="check-row">
                        <div class="custom-check" [class.checked]="item.checked"
                             (click)="toggleItem($index)">
                            @if (item.checked) {
                                <i class="pi pi-check" style="font-size:9px;color:white"></i>
                            }
                        </div>
                        <span [class.done]="item.checked">{{ item.text }}</span>
                    </div>
                }
            </div>
        }

        @if (note.reminder) {
            <div class="reminder-pill">
                <i class="pi pi-bell"></i>
                {{ formatReminder(note.reminder) }}
            </div>
        }

        <div class="card-toolbar" (click)="$event.stopPropagation()">
<<<<<<< HEAD
            <button class="tb" [title]="note.reminder ? 'Quitar recordatorio' : 'Añadir recordatorio'" (click)="toggleReminder($event)">
                <i class="pi pi-bell" [style.color]="note.reminder ? '#FBBC04' : ''"></i>
=======
            <button class="tb" title="Opciones de fondo" (click)="colorOpen.emit({ note: this.note, event: $event })">
                <i class="pi pi-palette"></i>
            </button>
            <button class="tb" title="Recordatorio" (click)="addReminder($event)">
                <i class="pi pi-bell"></i>
>>>>>>> af70188 (mejoras)
            </button>
            <button class="tb" title="Colaborador"><i class="pi pi-user-plus"></i></button>
            
            <input type="file" #fileInput style="display: none" accept="image/*" (change)="onFileSelected($event)">
            <button class="tb" title="Imagen" (click)="fileInput.click()">
                <i class="pi pi-image"></i>
            </button>

            <button class="tb" title="Archivar" (click)="archive()">
                <i class="pi pi-inbox"></i>
            </button>
            <button class="tb" title="Más opciones" (click)="openMenu($event)">
                <i class="pi pi-ellipsis-v"></i>
            </button>
        </div>
    </div>
    `,
    styles: [`
        .note-card {
            border-radius: 12px;
            padding: 14px 14px 8px;
            cursor: pointer;
            position: relative;
            min-height: 72px;
            break-inside: avoid;
            box-shadow:
                0 0 0 1px rgba(255,255,255,0.08),
                inset 0 1px 0 rgba(255,255,255,0.06),
                0 2px 8px rgba(0,0,0,0.35);
            transition: box-shadow 0.2s ease, transform 0.15s ease;
            overflow: hidden;
            background-size: cover;
            background-position: center;
        }
        .note-card::before {
            content: '';
            position: absolute;
            top: 0; left: 10%; right: 10%;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(251,188,4,0), transparent);
            transition: background 0.25s ease;
            border-radius: 0 0 4px 4px;
        }
        .note-card:hover, .note-card.hovered {
            box-shadow:
                0 0 0 1px rgba(255,255,255,0.18),
                inset 0 1px 0 rgba(255,255,255,0.1),
                0 6px 28px rgba(0,0,0,0.5),
                0 0 40px rgba(251,188,4,0.04);
            transform: translateY(-2px);
        }
        .note-card:hover::before, .note-card.hovered::before {
            background: linear-gradient(90deg, transparent, rgba(251,188,4,0.4), transparent);
        }
        .select-check {
            position: absolute; top: 10px; left: 10px;
            opacity: 0; transition: opacity 0.15s;
            z-index: 2;
        }
        .note-card:hover .select-check { opacity: 1; }
        .check-circle {
            width: 20px; height: 20px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3);
            background: rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.15s;
        }
        .check-circle.checked {
            background: #FBBC04;
            border-color: #FBBC04;
        }
        .check-circle:hover { border-color: rgba(255,255,255,0.6); }
        .pin-btn {
            position: absolute; top: 8px; right: 8px;
            background: transparent; border: none; cursor: pointer;
            color: rgba(255,255,255,0.3); font-size: 13px;
            padding: 5px; border-radius: 50%;
            opacity: 0; transition: opacity 0.15s, background 0.15s, color 0.15s;
            z-index: 2;
        }
        .pin-btn.is-pinned {
            opacity: 1 !important;
            color: #FBBC04 !important;
        }
        .note-card:hover .pin-btn { opacity: 1; }
        .pin-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
        .note-img {
            width: calc(100% + 28px);
            margin: -14px -14px 10px;
            max-height: 200px;
            object-fit: cover;
            border-radius: 12px 12px 0 0;
        }
        .note-title {
            color: #e8eaed;
            font-weight: 600;
            font-size: 14px;
            line-height: 1.45;
            margin-bottom: 6px;
            padding-right: 22px;
            word-break: break-word;
        }
        .note-content {
            color: rgba(255,255,255,0.55);
            font-size: 13px;
            line-height: 1.65;
            max-height: 180px;
            overflow: hidden;
            white-space: pre-wrap;
            word-break: break-word;
        }
        .note-checklist { margin: 4px 0 6px; }
        .check-row {
            display: flex; align-items: center; gap: 8px;
            margin-bottom: 5px;
        }
        .custom-check {
            width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0;
            border: 1.5px solid rgba(255,255,255,0.25);
            background: transparent;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; transition: all 0.15s;
        }
        .custom-check.checked {
            background: rgba(251,188,4,0.7);
            border-color: transparent;
        }
        .check-row span {
            font-size: 12px; color: rgba(255,255,255,0.65);
        }
        .check-row .done {
            text-decoration: line-through;
            color: rgba(255,255,255,0.25);
        }
        .reminder-pill {
            display: inline-flex; align-items: center; gap: 4px;
            margin-top: 8px; padding: 3px 9px;
            border-radius: 20px;
            background: rgba(255,255,255,0.06);
            border: 1px solid rgba(255,255,255,0.1);
            color: rgba(255,255,255,0.45); font-size: 11px;
        }
        .reminder-pill .pi { font-size: 10px; }
        .card-toolbar {
            display: flex; align-items: center; gap: 1px;
            margin-top: 8px;
            opacity: 0; transition: opacity 0.15s;
        }
        .note-card:hover .card-toolbar { opacity: 1; }
        .tb {
            color: rgba(255,255,255,0.35); font-size: 13px;
            padding: 5px 6px; border-radius: 50%;
            background: transparent; border: none; cursor: pointer;
            transition: color 0.12s, background 0.12s;
        }
        .tb:hover {
            color: rgba(255,255,255,0.85);
            background: rgba(255,255,255,0.09);
        }
    `]
})
export class NoteCardComponent {
    @Input() note!: Note;
    @Output() edit = new EventEmitter<Note>();
    @Output() menuOpen = new EventEmitter<{ note: Note; event: MouseEvent }>();
    @Output() reminderOpen = new EventEmitter<{ note: Note; event: MouseEvent }>();
    @Output() colorOpen = new EventEmitter<{ note: Note; event: MouseEvent }>();

    hovered = signal(false);
    selected = false;

    private readonly noteService = inject(NoteService);

    noteBg() { return getNoteBackground(this.note.color); }

    onCardClick(event: MouseEvent) { this.edit.emit(this.note); }

    pin() { this.noteService.togglePin(this.note.id).subscribe(); }

    archive() { this.noteService.toggleArchive(this.note.id).subscribe(); }

    toggleReminder(event: MouseEvent) {
        event.stopPropagation();
<<<<<<< HEAD
        if (this.note) {
            // Si tiene recordatorio, lo ponemos en null. Si no tiene, le ponemos la fecha actual.
            const newReminder = this.note.reminder ? null : new Date();
            this.noteService.update(this.note.id, { reminder: newReminder } as any).subscribe(() => {
                this.note.reminder = newReminder as any;
            });
        }
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file && this.note) {
            const reader = new FileReader();
            reader.onload = () => {
                const imageUrl = reader.result as string;
                this.note.image_url = imageUrl;
                this.noteService.update(this.note.id, { image_url: imageUrl } as any).subscribe();
            };
            reader.readAsDataURL(file);
        }
=======
        this.reminderOpen.emit({ note: this.note, event });
>>>>>>> af70188 (mejoras)
    }

    toggleItem(index: number) {
        if (!this.note.items) return;
        const updatedItems = this.note.items.map((item, i) =>
            i === index ? { ...item, checked: !item.checked } : item
        );
        this.noteService.update(this.note.id, { items: updatedItems }).subscribe();
    }

    openMenu(event: MouseEvent) {
        event.stopPropagation();
        this.menuOpen.emit({ note: this.note, event });
    }

    formatReminder(reminder: string) {
        return new Date(reminder).toLocaleDateString('es', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }
}