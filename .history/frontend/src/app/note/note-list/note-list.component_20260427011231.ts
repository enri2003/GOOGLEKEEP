import { Component, inject, OnInit, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { NoteService } from "../note.service";
import { Note } from "../shared/note.model";
import { NoteInputComponent } from "../note-input/note-input.component";
import { NoteCardComponent } from "../note-card/note-card.component";
import { NoteEditorComponent } from "../note-editor/note-editor.component";
import { NoteMenuComponent } from "../note-menu/note-menu.component";
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'app-note-list',
    standalone: true,
    imports: [CommonModule, NoteInputComponent, NoteCardComponent, NoteEditorComponent, NoteMenuComponent],
    template: `
    <div class="notes-page">

        <!-- Input crear nota -->
        @if (mode() === 'notes') {
            <div class="input-section">
                <app-note-input (saved)="noteService.load('notes')" />
            </div>
        }

        <!-- Banner papelera -->
        @if (mode() === 'trash') {
            <div class="trash-banner">
                <i class="pi pi-info-circle"></i>
                Las notas en la papelera se eliminan definitivamente después de 7 días.
            </div>
        }

        <!-- Notas fijadas -->
        @if (pinnedNotes().length && mode() === 'notes') {
            <div class="section-header">
                <i class="pi pi-thumbtack"></i>
                <span>Fijadas</span>
            </div>
            <div class="notes-grid">
                @for (note of pinnedNotes(); track note.id) {
                    <app-note-card [note]="note"
                                   (edit)="openEditor($event)"
                                   (menuOpen)="onMenuOpen($event)" />
                }
            </div>

            @if (otherNotes().length) {
                <div class="section-divider"></div>
                <div class="section-header">
                    <i class="pi pi-lightbulb"></i>
                    <span>Otras</span>
                </div>
            }
        }

        <!-- Notas principales -->
        @if (otherNotes().length) {
            <div [ngClass]="viewMode === 'grid' ? 'notes-grid' : 'notes-list'">
                @for (note of otherNotes(); track note.id) {
                    <app-note-card [note]="note"
                                   (edit)="openEditor($event)"
                                   (menuOpen)="onMenuOpen($event)" />
                }
            </div>
        }

        <!-- Estado vacío -->
        @if (!pinnedNotes().length && !otherNotes().length) {
            <div class="empty-state">
                <div class="empty-ring">
                    <i [class]="emptyIcon()"></i>
                </div>
                <p class="empty-title">{{ emptyMessage() }}</p>
                @if (mode() === 'notes') {
                    <p class="empty-hint">Haz clic en "Crear una nota..." para empezar</p>
                }
            </div>
        }

        <!-- Editor modal -->
        <app-note-editor [note]="editingNote()"
                         [visible]="editorVisible"
                         (closed)="onEditorClosed()" />

        <!-- Menú contextual -->
        <app-note-menu #noteMenu [note]="menuNote()" [mode]="mode()" />
    </div>
    `,
    styles: [`:host { display: block; }`, `
        .notes-page {
            padding: 24px 28px;
        }
        .input-section {
            max-width: 620px;
            margin: 0 auto 28px;
        }
        .notes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 16px;
            align-items: start;
        }
        @media (max-width: 768px) {
            .notes-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 10px; }
            .notes-page { padding: 16px; }
            .input-section { margin: 0 0 20px; }
        }
        .section-header {
            display: flex; align-items: center; gap: 6px;
            color: rgba(255,255,255,0.28);
            font-size: 10px; font-weight: 700;
            letter-spacing: 1.5px; text-transform: uppercase;
            margin-bottom: 14px; padding-left: 2px;
        }
        .section-header .pi { font-size: 10px; }
        .section-divider {
            height: 1px;
            background: rgba(255,255,255,0.05);
            margin: 24px 0;
        }
        .trash-banner {
            display: flex; align-items: center; gap: 10px;
            background: rgba(251,188,4,0.06);
            border: 1px solid rgba(251,188,4,0.15);
            border-radius: 12px;
            color: rgba(255,255,255,0.45);
            font-size: 13px;
            padding: 12px 18px;
            margin-bottom: 24px;
            max-width: 620px;
            margin-left: auto; margin-right: auto;
        }
        .trash-banner .pi { color: rgba(251,188,4,0.6); }

        /* Estado vacío - Premium Design */
        .empty-state {
            display: flex; flex-direction: column; align-items: center;
            padding: 120px 20px 80px; text-align: center;
        }
        .empty-ring {
            width: 110px; height: 110px; border-radius: 50%;
            background: linear-gradient(135deg, rgba(251,188,4,0.12) 0%, rgba(251,188,4,0.02) 100%);
            border: 2px solid rgba(251,188,4,0.25);
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 32px;
            box-shadow: 
                0 0 80px rgba(251,188,4,0.12),
                0 0 40px rgba(251,188,4,0.06),
                inset 0 1px 2px rgba(255,255,255,0.08);
            animation: floatPulse 3s ease-in-out infinite;
        }
        @keyframes floatPulse {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
        }
        .empty-ring .pi {
            font-size: 48px;
            background: linear-gradient(135deg, #FBBC04, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .empty-title {
            font-size: 24px; font-weight: 600;
            background: linear-gradient(135deg, rgba(255,255,255,0.6), rgba(251,188,4,0.3));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0 0 12px;
            letter-spacing: -0.4px;
        }
        .empty-hint {
            font-size: 14px;
            color: rgba(255,255,255,0.4);
            margin: 0;
            font-weight: 500;
        }
    `]
})
export class NoteListComponent implements OnInit {
    readonly noteService = inject(NoteService);
    layoutService = inject(LayoutService);

    mode = signal<'notes' | 'archived' | 'trash' | 'reminders'>('notes');
    editingNote = signal<Note | null>(null);
    editorVisible = signal(false);
    menuNote = signal<Note | null>(null);

    @ViewChild('noteMenu') noteMenu!: NoteMenuComponent;

    ngOnInit() {
        this.route.data.subscribe(data => {
            const m = (data['mode'] ?? 'notes') as 'notes' | 'archived' | 'trash' | 'reminders';
            this.mode.set(m);
            this.noteService.load(m);
        });
    }

    pinnedNotes() {
        return this.noteService.notes().filter(n => n.pinned);
    }

    otherNotes() {
        const all = this.noteService.notes();
        return this.mode() === 'notes' ? all.filter(n => !n.pinned) : all;
    }

    emptyIcon() {
        const map: Record<string, string> = {
            archived: 'pi pi-inbox',
            trash: 'pi pi-trash',
            reminders: 'pi pi-bell',
            notes: 'pi pi-lightbulb',
        };
        return map[this.mode()] ?? 'pi pi-lightbulb';
    }

    emptyMessage() {
        const map: Record<string, string> = {
            notes: 'Tus notas aparecerán aquí',
            archived: 'Las notas archivadas aparecerán aquí',
            trash: 'No hay notas en la papelera',
            reminders: 'Las notas con recordatorio aparecerán aquí',
        };
        return map[this.mode()] ?? '';
    }

    openEditor(note: Note) {
        this.editingNote.set(note);
        this.editorVisible.set(true);
    }

    onEditorClosed() {
        this.editorVisible.set(false);
        this.noteService.load(this.mode());
    }

    onMenuOpen({ note, event }: { note: Note; event: MouseEvent }) {
        this.menuNote.set(note);
        setTimeout(() => this.noteMenu?.open(event), 0);
    }

    get viewMode() {
        return this.layoutService.viewMode();
    }
}
