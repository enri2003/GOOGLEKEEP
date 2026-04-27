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
    template: `<p-menu #menu [model]="items" [popup]="true" appendTo="body" styleClass="keep-menu" />`
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
                    command: () => {
                        if (this.note) this.noteService.softDelete(this.note.id).subscribe(() => this.deleted.emit());
                    }
                },
                {
                    label: 'Agregar etiqueta',
                    command: () => { /* TODO: label picker */ }
                },
                {
                    label: 'Agregar dibujo',
                    command: () => { /* mock */ }
                },
                {
                    label: 'Hacer una copia',
                    command: () => {
                        if (this.note) this.noteService.duplicate(this.note.id).subscribe();
                    }
                },
                {
                    label: this.note?.type === 'checklist' ? 'Ocultar casillas de verificación' : 'Mostrar casillas de verificación',
                    command: () => {
                        if (!this.note) return;
                        const newType = this.note.type === 'checklist' ? 'text' : 'checklist';
                        this.noteService.update(this.note.id, { type: newType } as any).subscribe();
                    }
                },
                {
                    label: 'Copiar en Documentos de Google',
                    command: () => { /* mock */ }
                },
                {
                    label: 'Historial de versiones',
                    command: () => { /* mock */ }
                }
            ];
        }
    }

    open(target: HTMLElement) {
        this.buildMenu();
        // Simulación de evento para posicionar correctamente abajo
        const mockEvent = {
            currentTarget: target,
            target: target,
            preventDefault: () => {},
            stopPropagation: () => {}
        };
        this.menu.toggle(mockEvent as any);
    }
}