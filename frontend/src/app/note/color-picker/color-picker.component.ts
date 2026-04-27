import { Component, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Popover, PopoverModule } from 'primeng/popover';
import { Note, NOTE_COLORS } from '../shared/note.model';
import { NoteService } from '../note.service';

@Component({
    selector: 'app-color-picker',
    standalone: true,
    imports: [CommonModule, PopoverModule],
    template: `
    <p-popover #op [style]="{ background: '#202124', border: '1px solid #5f6368', borderRadius: '8px', padding: '8px' }">
        <div class="palette-container">
            <!-- Fila de Colores -->
            <div class="palette-row">
                <div class="color-item none" 
                     [class.selected]="!selectedNote()?.color || selectedNote()?.color === 'default'"
                     (click)="setColor('default')"
                     title="Predeterminado">
                    <i class="pi pi-ban"></i>
                    <div class="check-mark" *ngIf="!selectedNote()?.color || selectedNote()?.color === 'default'">
                        <i class="pi pi-check"></i>
                    </div>
                </div>
                @for (c of colors; track c.value) {
                    <div class="color-item" 
                         [style.background]="c.bg"
                         [class.selected]="selectedNote()?.color === c.value"
                         (click)="setColor(c.value)"
                         [title]="c.name">
                        <div class="check-mark" *ngIf="selectedNote()?.color === c.value">
                            <i class="pi pi-check"></i>
                        </div>
                    </div>
                }
            </div>

            <div class="divider"></div>

            <!-- Fila de Imágenes -->
            <div class="palette-row">
                <div class="color-item none" 
                     [class.selected]="!selectedNote()?.background_image"
                     (click)="setImage(null)"
                     title="Sin fondo">
                    <i class="pi pi-image"></i>
                    <div class="check-mark" *ngIf="!selectedNote()?.background_image">
                        <i class="pi pi-check"></i>
                    </div>
                </div>
                @for (img of images; track img.url) {
                    <div class="color-item img-item" 
                         [style.background-image]="'url(' + img.url + ')'"
                         [class.selected]="selectedNote()?.background_image === img.url"
                         (click)="setImage(img.url)"
                         [title]="img.name">
                        <div class="check-mark" *ngIf="selectedNote()?.background_image === img.url">
                            <i class="pi pi-check"></i>
                        </div>
                    </div>
                }
            </div>
        </div>
    </p-popover>
    `,
    styles: [`
        .palette-container {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: fit-content;
        }
        .palette-row {
            display: flex;
            gap: 6px;
            padding: 4px;
        }
        .divider {
            height: 1px;
            background: #3c4043;
            margin: 2px 4px;
        }
        .color-item {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            cursor: pointer;
            position: relative;
            border: 2px solid transparent;
            transition: border-color 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            background-size: cover;
            background-position: center;
        }
        .color-item:hover {
            border-color: #e8eaed;
        }
        .color-item.selected {
            border-color: #a142f4;
        }
        .color-item.none {
            background: transparent;
            border: 1px solid #5f6368;
            color: #9aa0a6;
        }
        .img-item {
            border: 1px solid #5f6368;
        }
        .check-mark {
            position: absolute;
            top: -6px;
            right: -6px;
            width: 16px;
            height: 16px;
            background: #a142f4;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 8px;
        }
    `]
})
export class ColorPickerComponent {
    @ViewChild('op') op!: Popover;
    @Output() colorChanged = new EventEmitter<string>();
    @Output() imageChanged = new EventEmitter<string | null>();

    selectedNote = signal<Note | null>(null);

    colors = NOTE_COLORS.filter(c => c.value !== 'default');
    
    images = [
        { name: 'Comida', url: 'https://www.gstatic.com/keep/backgrounds/food_dark_0609.svg' },
        { name: 'Música', url: 'https://www.gstatic.com/keep/backgrounds/music_dark_0609.svg' },
        { name: 'Recetas', url: 'https://www.gstatic.com/keep/backgrounds/recipe_dark_0609.svg' },
        { name: 'Notas', url: 'https://www.gstatic.com/keep/backgrounds/notes_dark_0609.svg' },
        { name: 'Lugares', url: 'https://www.gstatic.com/keep/backgrounds/places_dark_0609.svg' },
        { name: 'Viajes', url: 'https://www.gstatic.com/keep/backgrounds/travel_dark_0609.svg' },
        { name: 'Celebración', url: 'https://www.gstatic.com/keep/backgrounds/celebration_dark_0609.svg' },
    ];

    private readonly noteService = inject(NoteService);

    show(event: Event, note: Note | null) {
        this.selectedNote.set(note);
        this.op.toggle(event);
    }

    setColor(color: string) {
        if (this.selectedNote()) {
            this.noteService.update(this.selectedNote()!.id, { color }).subscribe();
        } else {
            this.colorChanged.emit(color);
        }
        this.op.hide();
    }

    setImage(imageUrl: string | null) {
        if (this.selectedNote()) {
            this.noteService.update(this.selectedNote()!.id, { background_image: imageUrl } as any).subscribe();
        } else {
            this.imageChanged.emit(imageUrl);
        }
        this.op.hide();
    }
}
