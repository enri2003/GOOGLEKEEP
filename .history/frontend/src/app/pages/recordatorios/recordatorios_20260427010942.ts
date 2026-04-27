import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '@/app/note/note.service';
import { NoteCardComponent } from '@/app/note/note-card/note-card.component';
import { Note } from '@/app/note/shared/note.model';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'app-recordatorios',
    standalone: true,
    imports: [CommonModule, NoteCardComponent],
    template: `
    <div class="notes-page">
        <h2 class="section-header"><i class="pi pi-bell"></i> Recordatorios</h2>
        <div [ngClass]="viewMode === 'grid' ? 'notes-grid' : 'notes-list'">
            @for (note of reminderNotes(); track note.id) {
                <app-note-card [note]="note" />
            }
        </div>
        @if (!reminderNotes().length) {
            <div class="empty-state">
                <div class="empty-ring"><i class="pi pi-bell-slash"></i></div>
                <p class="empty-title">No tienes recordatorios</p>
            </div>
        }
    </div>
    `,
    styles: [`:host { display: block; }`]
})
export class Recordatorios implements OnInit {
    noteService = inject(NoteService);
    layoutService = inject(LayoutService);
    reminderNotes = () => this.noteService.notes().filter(n => n.reminder);
    
    get viewMode() {
        return this.layoutService.viewMode();
    }

    ngOnInit() {
        this.noteService.load('reminders');
    }
}
