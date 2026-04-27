import { Component, EventEmitter, inject, Input, OnChanges, Output, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { Note, NoteItem, getNoteBackground, NOTE_COLORS } from "../shared/note.model";
import { NoteService } from "../note.service";
import { ColorPickerComponent } from "../color-picker/color-picker.component";

@Component({
    selector: 'app-note-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, DialogModule, ColorPickerComponent],
    template: `
    <p-dialog [visible]="visible()" (onHide)="close()"
              [modal]="true" [draggable]="false" [resizable]="false"
              [style]="{width:'600px', 'max-width':'95vw', 'border-radius':'10px'}"
              [contentStyle]="{'background': noteBg(), 'background-image': editBackgroundImage ? 'url(' + editBackgroundImage + ')' : 'none', 'background-size': 'cover', 'background-position': 'center', 'border-radius': '10px', 'padding': '0', 'border': 'none'}"
              [showHeader]="false"
              styleClass="note-editor-dialog">

        <!-- Área de contenido -->
        <div class="editor-body" [style.background]="noteBg()">
            @if (editImageUrl) {
                <div class="editor-image-wrap">
                    <img [src]="editImageUrl" alt="" class="editor-img" />
                    <button class="remove-img-btn" (click)="editImageUrl = null" title="Eliminar imagen">
                        <i class="pi pi-times"></i>
                    </button>
                </div>
            }
            <!-- Título + Pin -->
            <div class="editor-title-row">
                <input type="text" [(ngModel)]="editTitle" placeholder="Título"
                       class="editor-title-input" />
                <button type="button" class="pin-toggle" (click)="togglePin()"
                        [title]="editPinned ? 'Desfijar' : 'Fijar nota'">
                    <i class="pi pi-thumbtack" [style.color]="editPinned ? '#FBBC04' : '#9aa0a6'"></i>
                </button>
            </div>

            <!-- Contenido -->
            @if (note?.type === 'checklist') {
                <div class="editor-checklist">
                    @for (item of editItems; track $index) {
                        <div class="editor-check-row">
                            <input type="checkbox" [(ngModel)]="item.checked" class="accent-amber-400" />
                            <input type="text" [(ngModel)]="item.text"
                                   class="editor-check-input"
                                   [class.done]="item.checked"
                                   placeholder="Elemento de la lista" />
                            <button type="button" class="remove-item-btn" (click)="removeItem($index)">
                                <i class="pi pi-times"></i>
                            </button>
                        </div>
                    }
                    <button type="button" class="add-item-btn" (click)="addItem()">
                        <i class="pi pi-plus"></i> Elemento de la lista
                    </button>
                </div>
            } @else {
                <textarea [(ngModel)]="editContent" placeholder="Crear una nota..."
                          class="editor-textarea" rows="7"></textarea>
            }

            <!-- Timestamp -->
            <div class="editor-timestamp">Editado: {{ now() }}</div>
        </div>

        <!-- Toolbar inferior -->
        <div class="editor-toolbar" [style.background]="noteBg()">
            <div class="toolbar-left">
                <!-- Color picker -->
                <div class="color-picker-wrap">
                    <button type="button" class="tb-btn" title="Opciones de fondo"
                            (click)="colorPicker.show($event, note)">
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-color-picker #colorPicker (colorChanged)="editColor = $event; applyColor()" (imageChanged)="editBackgroundImage = $event; applyColor()" />
                </div>
                <button type="button" class="tb-btn" title="Recordatorio"><i class="pi pi-bell"></i></button>
                <button type="button" class="tb-btn" title="Colaborador"><i class="pi pi-user-plus"></i></button>
                
                <button type="button" class="tb-btn" title="Añadir imagen" (click)="fileInput.click()">
                    <i class="pi pi-image"></i>
                </button>
                <input #fileInput type="file" (change)="onImageSelect($event)" accept="image/*" style="display: none" />

                <button type="button" class="tb-btn" title="Archivar" (click)="archive()">
                    <i class="pi pi-inbox"></i>
                </button>
                <div class="tb-divider"></div>
                <button type="button" class="tb-btn" title="Deshacer" (click)="undo()">
                    <i class="pi pi-undo"></i>
                </button>
                <button type="button" class="tb-btn" title="Rehacer" (click)="redo()">
                    <i class="pi pi-replay"></i>
                </button>
            </div>
            <button type="button" class="btn-close" (click)="close()">Cerrar</button>
        </div>
    </p-dialog>
    `,
    styles: [`
        :host ::ng-deep .note-editor-dialog .p-dialog {
            border-radius: 10px !important;
            overflow: hidden;
            box-shadow: 0 8px 40px rgba(0,0,0,0.6) !important;
            border: 1px solid rgba(255,255,255,0.1) !important;
        }
        :host ::ng-deep .note-editor-dialog .p-dialog-content {
            padding: 0 !important;
        }
        .editor-body {
            padding: 16px 16px 4px;
            border-radius: 10px 10px 0 0;
        }
        .editor-title-row {
            display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px;
        }
        .editor-title-input {
            flex: 1; background: transparent; border: none; outline: none;
            color: #e8eaed; font-size: 16px; font-weight: 600; line-height: 1.4;
        }
        .editor-title-input::placeholder { color: #5f6368; }
        .pin-toggle {
            background: transparent; border: none; cursor: pointer;
            padding: 4px 6px; border-radius: 50%; flex-shrink: 0;
            transition: background 0.15s;
        }
        .pin-toggle:hover { background: rgba(255,255,255,0.1); }
        .editor-checklist { padding: 4px 0 8px; }
        .editor-check-row {
            display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
        }
        .editor-check-input {
            flex: 1; background: transparent; border: none; outline: none;
            color: #e8eaed; font-size: 14px; border-bottom: 1px solid transparent;
            padding: 3px 0; transition: border-color 0.15s;
        }
        .editor-check-input:focus { border-bottom-color: rgba(255,255,255,0.2); }
        .editor-check-input.done { text-decoration: line-through; color: #5f6368; }
        .editor-check-input::placeholder { color: #5f6368; }
        .remove-item-btn {
            color: #5f6368; background: transparent; border: none;
            cursor: pointer; font-size: 11px; padding: 3px;
            border-radius: 4px;
        }
        .remove-item-btn:hover { color: #9aa0a6; }
        .add-item-btn {
            display: flex; align-items: center; gap: 6px;
            color: #5f6368; background: transparent; border: none;
            cursor: pointer; font-size: 13px; padding: 4px 0; margin-top: 4px;
        }
        .add-item-btn:hover { color: #9aa0a6; }
        .editor-textarea {
            display: block; width: 100%; background: transparent; border: none;
            resize: none; outline: none; color: #c8cacf; font-size: 14px;
            line-height: 1.7; min-height: 120px;
        }
        .editor-textarea::placeholder { color: #5f6368; }
        .editor-image-wrap {
            position: relative;
            margin: -16px -16px 12px;
            max-height: 450px;
            overflow: hidden;
        }
        .editor-img {
            width: 100%;
            display: block;
            object-fit: cover;
        }
        .remove-img-btn {
            position: absolute; top: 12px; right: 12px;
            background: rgba(0,0,0,0.5); color: white;
            border: none; border-radius: 50%;
            width: 32px; height: 32px; display: flex;
            align-items: center; justify-content: center;
            cursor: pointer; font-size: 14px;
            transition: background 0.2s;
        }
        .remove-img-btn:hover { background: rgba(0,0,0,0.7); }
        .editor-timestamp {
            text-align: right; color: #5f6368; font-size: 11px; padding: 8px 0 6px;
        }
        .editor-toolbar {
            display: flex; align-items: center; justify-content: space-between;
            padding: 6px 10px 8px;
            border-top: 1px solid rgba(255,255,255,0.07);
            border-radius: 0 0 10px 10px;
        }
        .toolbar-left { display: flex; align-items: center; gap: 2px; }
        .tb-btn {
            color: #9aa0a6; font-size: 14px; padding: 6px 7px;
            border-radius: 50%; background: transparent; border: none; cursor: pointer;
            transition: color 0.15s, background 0.15s;
        }
        .tb-btn:hover { color: #e8eaed; background: rgba(255,255,255,0.1); }
        .tb-divider {
            width: 1px; height: 20px; background: rgba(255,255,255,0.1); margin: 0 4px;
        }
        .color-picker-wrap { position: relative; }
        .color-popup {
            position: absolute; bottom: calc(100% + 8px); left: 0;
            display: flex; gap: 6px; padding: 10px;
            background: #3c3d40; border-radius: 10px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.08);
            z-index: 100; flex-wrap: wrap; max-width: 220px;
        }
        .color-dot {
            width: 28px; height: 28px; border-radius: 50%; border: 2px solid transparent;
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: transform 0.1s, border-color 0.1s;
        }
        .color-dot:hover { transform: scale(1.15); }
        .color-dot.selected { border-color: white; }
        .btn-close {
            color: #FBBC04; background: transparent; border: none; cursor: pointer;
            font-size: 13px; font-weight: 600; padding: 6px 16px; border-radius: 6px;
            letter-spacing: 0.3px; transition: background 0.15s;
        }
        .btn-close:hover { background: rgba(251,188,4,0.12); }
    `]
})
export class NoteEditorComponent implements OnChanges {
    private readonly noteService = inject(NoteService);

    @Input() note: Note | null = null;
    @Input() visible = signal(false);
    @Output() closed = new EventEmitter<void>();

    editTitle = '';
    editContent = '';
    editItems: NoteItem[] = [];
    editPinned = false;
    editColor = 'default';
    editBackgroundImage: string | null = null;
    editImageUrl: string | null = null;
    showColors = signal(false);
    colors = NOTE_COLORS;

    @ViewChild('colorPicker') colorPicker!: ColorPickerComponent;

    private history: { title: string; content: string; items: NoteItem[] }[] = [];
    private historyIndex = -1;

    ngOnChanges() {
        if (this.note) {
            this.editTitle = this.note.title ?? '';
            this.editContent = this.note.content ?? '';
            this.editItems = this.note.items ? this.note.items.map(i => ({ ...i })) : [];
            this.editPinned = this.note.pinned;
            this.editColor = this.note.color ?? 'default';
            this.editBackgroundImage = this.note.background_image ?? null;
            this.editImageUrl = this.note.image_url ?? null;
            this.history = [];
            this.historyIndex = -1;
            this.pushHistory();
        }
    }

    noteBg() { return getNoteBackground(this.editColor); }

    now() {
        return new Date().toLocaleString('es', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }

    addItem() { this.editItems.push({ text: '', checked: false }); }
    removeItem(i: number) { this.editItems.splice(i, 1); }

    togglePin() {
        this.editPinned = !this.editPinned;
        if (this.note) this.noteService.togglePin(this.note.id).subscribe();
    }

    applyColor() {
        if (this.note) {
            this.noteService.update(this.note.id, { 
                color: this.editColor,
                background_image: this.editBackgroundImage
            } as any).subscribe();
        }
    }

    archive() {
        if (this.note) {
            this.noteService.toggleArchive(this.note.id).subscribe();
            this.close();
        }
    }

    private pushHistory() {
        const state = {
            title: this.editTitle,
            content: this.editContent,
            items: this.editItems.map(i => ({ ...i }))
        };
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(state);
        this.historyIndex = this.history.length - 1;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.pushHistory();
            this.historyIndex -= 2;
            if (this.historyIndex < 0) this.historyIndex = 0;
            const s = this.history[this.historyIndex];
            this.editTitle = s.title;
            this.editContent = s.content;
            this.editItems = s.items.map(i => ({ ...i }));
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const s = this.history[this.historyIndex];
            this.editTitle = s.title;
            this.editContent = s.content;
            this.editItems = s.items.map(i => ({ ...i }));
        }
    }

    onImageSelect(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e: any) => {
            this.editImageUrl = e.target.result;
            this.applyColor(); // Guardar cambios inmediatamente (color/imagen)
        };
        reader.readAsDataURL(file);
    }

    close() {
        if (this.note) {
            this.noteService.update(this.note.id, {
                title: this.editTitle,
                content: this.editContent,
                items: this.note.type === 'checklist' ? this.editItems : undefined,
                pinned: this.editPinned,
                color: this.editColor,
                background_image: this.editBackgroundImage,
                image_url: this.editImageUrl,
            } as any).subscribe();
        }
        this.showColors.set(false);
        this.visible.set(false);
        this.closed.emit();
    }
}
