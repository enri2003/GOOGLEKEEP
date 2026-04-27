import { inject, Injectable, signal } from "@angular/core";
import { tap } from "rxjs";
import { BasicService } from "../service/basic.service";
import { Note } from "./shared/note.model";

@Injectable({ providedIn: 'root' })
export class NoteService {
    private readonly http = inject(BasicService);

    notes = signal<Note[]>([]);
    mode = signal<'notes' | 'archived' | 'trash' | 'reminders'>('notes');
    searchQuery = signal('');

    load(mode: 'notes' | 'archived' | 'trash' | 'reminders' = 'notes') {
        this.mode.set(mode);
        const url = mode === 'notes' ? 'note' : mode === 'archived' ? 'note/archived' : mode === 'trash' ? 'note/trash' : 'note/reminders';
        const q = this.searchQuery();
        const finalUrl = (mode === 'notes' && q) ? `note?q=${encodeURIComponent(q)}` : url;
        this.http.baseGet(finalUrl).subscribe({
            next: (data: Note[]) => this.notes.set(data ?? []),
            error: () => this.notes.set([])
        });
    }

    create(dto: Partial<Note>) {
        return this.http.basePost('note', dto).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    update(id: number, dto: Partial<Note>) {
        return this.http.basePatch(`note/${id}`, dto).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    togglePin(id: number) {
        return this.http.basePatch(`note/${id}/pin`, {}).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    toggleArchive(id: number) {
        return this.http.basePatch(`note/${id}/archive`, {}).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    softDelete(id: number) {
        return this.http.baseDelete(`note/${id}`).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    restore(id: number) {
        return this.http.basePost(`note/${id}/restore`, {}).pipe(
            tap(() => this.load('trash'))
        );
    }

    deletePermanent(id: number) {
        return this.http.baseDelete(`note/${id}/permanent`).pipe(
            tap(() => this.load('trash'))
        );
    }

    duplicate(id: number) {
        return this.http.basePost(`note/${id}/duplicate`, {}).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    shareNote(noteId: number, email: string) {
        return this.http.basePost('notesharecontroller/save', { 
            noteId: noteId, 
            email: email 
        }).pipe(
            tap(() => this.load(this.mode()))
        );
    }

    searchUsers(query: string) {
        return this.http.basePost('usuariocontroller/getall', { q: query });
    }
}