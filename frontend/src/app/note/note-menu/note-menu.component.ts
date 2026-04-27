import { Component, EventEmitter, inject, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Menu, MenuModule } from "primeng/menu";
import { MenuItem } from "primeng/api";
import { Note } from "../shared/note.model";
import { NoteService } from "../note.service";

@Component({
    selector: 'app-note-menu',
    standalone: true,
    imports: [CommonModule, MenuModule],
    template: `<p-menu #menu [model]="items" [popup]="true" appendTo="body" />`
})
export class NoteMenuComponent implements OnChanges {
    @Input() note: Note | null = null;
    @Input() mode: 'notes' | 'archived' | 'trash' | 'reminders' = 'notes';
    @Output() deleted = new EventEmitter<void>();

    @ViewChild('menu') menu!: Menu;

    private readonly noteService = inject(NoteService);
    items: MenuItem[] = [];

    ngOnChanges() {
        this.buildMenu();
    }

    private buildMenu() {
        if (!this.note) return;

        if (this.mode === 'trash') {
            this.items = [
                {
                    label: 'Eliminar permanentemente',
                    icon: 'pi pi-times-circle',
                    command: () => {
                        if (this.note) this.noteService.deletePermanent(this.note.id).subscribe(() => this.deleted.emit());
                    }
                },
                {
                    label: 'Restaurar nota',
                    icon: 'pi pi-undo',
                    command: () => {
                        if (this.note) this.noteService.restore(this.note.id).subscribe();
                    }
                }
            ];
        } else {
            this.items = [
                {
                    label: 'Borrar la nota',
                    icon: 'pi pi-trash',
                    command: () => {
                        if (this.note) this.noteService.softDelete(this.note.id).subscribe(() => this.deleted.emit());
                    }
                },
                {
                    label: 'Hacer una copia',
                    icon: 'pi pi-copy',
                    command: () => {
                        if (this.note) this.noteService.duplicate(this.note.id).subscribe();
                    }
                },
                {
                    label: 'Agregar etiqueta',
                    icon: 'pi pi-tag',
                    command: () => { /* TODO: label picker */ }
                },
                {
                    label: 'Agregar dibujo',
                    icon: 'pi pi-pencil',
                    command: () => { /* mock */ }
                },
                {
                    label: this.note?.type === 'checklist' ? 'Ocultar casillas de verificación' : 'Mostrar casillas de verificación',
                    icon: 'pi pi-check-square',
                    command: () => {
                        if (!this.note) return;
                        const newType = this.note.type === 'checklist' ? 'text' : 'checklist';
                        this.noteService.update(this.note.id, { type: newType } as any).subscribe();
                    }
                },
                {
                    label: 'Copiar en Google Docs',
                    icon: 'pi pi-file',
                    command: () => { /* mock */ }
                },
                {
                    label: 'Historial de versiones',
                    icon: 'pi pi-history',
                    command: () => { /* mock */ }
                }
            ];
        }
    }

    open(event: MouseEvent) {
        this.buildMenu();
        this.menu.toggle(event);
    }
}
