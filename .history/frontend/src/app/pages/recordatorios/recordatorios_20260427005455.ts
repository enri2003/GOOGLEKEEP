import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoteService } from '@/app/note/note.service';
import { NoteCardComponent } from '@/app/note/note-card/note-card.component';
import { Note } from '@/app/note/shared/note.model';

@Component({
    selector: 'app-recordatorios',
    standalone: true,
    imports: [CommonModule, NoteCardComponent],
    template: `
    <div class="notes-page">
        <h2 class="section-header"><i class="pi pi-bell"></i> Recordatorios</h2>
        <div class="notes-grid">
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
    reminderNotes = () => this.noteService.notes().filter(n => n.reminder);

    ngOnInit() {
        this.noteService.load('reminders');
    }
}
