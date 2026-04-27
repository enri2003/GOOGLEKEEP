import { Component, EventEmitter, inject, Output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Popover, PopoverModule } from 'primeng/popover';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { Note } from '../shared/note.model';
import { NoteService } from '../note.service';

@Component({
    selector: 'app-reminder-picker',
    standalone: true,
    imports: [CommonModule, FormsModule, PopoverModule, DatePickerModule, SelectModule, ButtonModule],
    template: `
    <p-popover #op [style]="{ width: '300px', padding: '0', background: '#202124', border: 'none', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0,0,0,0.3), 0 4px 8px 3px rgba(0,0,0,0.15)' }">
        <div class="reminder-dialog" *ngIf="view() === 'main'">
            <div class="menu-header">Recordatorio:</div>
            <div class="menu-item" (click)="setQuickReminder('today')">
                <span class="label">Hoy más tarde</span>
                <span class="time">20:00</span>
            </div>
            <div class="menu-item" (click)="setQuickReminder('tomorrow')">
                <span class="label">Mañana</span>
                <span class="time">08:00</span>
            </div>
            <div class="menu-item" (click)="setQuickReminder('nextWeek')">
                <span class="label">Próxima semana</span>
                <span class="time">lun, 08:00</span>
            </div>
            <div class="menu-divider"></div>
            <div class="menu-item" (click)="view.set('custom')">
                <i class="pi pi-clock" style="margin-right: 12px; font-size: 14px;"></i>
                <span class="label">Elegir fecha y hora</span>
            </div>
            <div class="menu-item">
                <i class="pi pi-map-marker" style="margin-right: 12px; font-size: 14px;"></i>
                <span class="label">Elegir sitio</span>
            </div>
        </div>

        <div class="reminder-dialog custom-view" *ngIf="view() === 'custom'">
            <div class="header">
                <button class="back-btn" (click)="view.set('main')">
                    <i class="pi pi-arrow-left" style="font-size: 14px;"></i>
                </button>
                <span>Elegir fecha y hora</span>
            </div>
            
            <div class="content">
                <div class="field-item">
                    <p-datepicker 
                        [(ngModel)]="selectedDate" 
                        [showIcon]="false" 
                        appendTo="body"
                        placeholder="Fecha"
                        dateFormat="dd M yy"
                        [style]="{ width: '100%' }"
                    />
                    <i class="pi pi-caret-down field-chevron"></i>
                </div>

                <div class="field-item">
                    <p-select 
                        [(ngModel)]="selectedTime" 
                        [options]="timeOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="Hora"
                        [style]="{ width: '100%' }"
                    />
                    <i class="pi pi-caret-down field-chevron"></i>
                </div>

                <div class="field-item">
                    <p-select 
                        [(ngModel)]="selectedRepeat" 
                        [options]="repeatOptions" 
                        optionLabel="label" 
                        optionValue="value"
                        placeholder="Repetir"
                        [style]="{ width: '100%' }"
                    />
                    <i class="pi pi-caret-down field-chevron"></i>
                </div>
            </div>

            <div class="footer">
                <button class="save-btn" (click)="save()">Guardar</button>
            </div>
        </div>
    </p-popover>
    `,
    styles: [`
        .reminder-dialog {
            color: #e8eaed;
            font-family: 'Roboto', Arial, sans-serif;
            background: #202124;
            border-radius: 8px;
            overflow: hidden;
            padding: 6px 0;
        }
        .menu-header {
            padding: 12px 16px;
            font-size: 14px;
            color: #e8eaed;
        }
        .menu-item {
            padding: 8px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            font-size: 14px;
            color: #e8eaed;
        }
        .menu-item:hover {
            background: rgba(255,255,255,0.1);
        }
        .menu-item .label {
            flex: 1;
        }
        .menu-item .time {
            color: #9aa0a6;
            font-size: 13px;
        }
        .menu-divider {
            height: 1px;
            background: #3c4043;
            margin: 4px 0;
        }

        .custom-view {
            padding: 0;
        }
        .header {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 14px 12px;
            font-size: 15px;
            font-weight: 400;
        }
        .back-btn {
            background: transparent;
            border: none;
            color: #e8eaed;
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }
        .back-btn:hover {
            background: rgba(255,255,255,0.1);
        }
        .content {
            padding: 0 16px 8px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .field-item {
            position: relative;
            padding-top: 12px;
            border-bottom: 1px solid #5f6368;
            margin-bottom: 12px;
            transition: border-bottom-color 0.2s;
        }
        .field-item:hover {
            border-bottom-color: #e8eaed;
        }
        .field-chevron {
            position: absolute;
            right: 4px;
            top: 24px;
            font-size: 10px;
            color: #9aa0a6;
            pointer-events: none;
        }
        ::ng-deep .p-popover {
            border: 1px solid #5f6368 !important;
        }
        ::ng-deep .p-datepicker, ::ng-deep .p-select {
            background: transparent !important;
            border: none !important;
            padding: 0 !important;
            width: 100%;
        }
        ::ng-deep .p-datepicker input, ::ng-deep .p-select .p-select-label {
            background: transparent !important;
            color: #e8eaed !important;
            font-size: 14px !important;
            padding: 4px 0 8px 4px !important;
            box-shadow: none !important;
        }
        ::ng-deep .p-select .p-select-dropdown {
            display: none !important;
        }
        .footer {
            display: flex;
            justify-content: flex-end;
            padding: 8px 16px 16px;
        }
        .save-btn {
            background: transparent;
            border: none;
            color: #e8eaed;
            font-size: 14px;
            font-weight: 500;
            padding: 10px 24px;
            cursor: pointer;
            border-radius: 4px;
            transition: background 0.2s;
        }
        .save-btn:hover {
            background: rgba(255,255,255,0.04);
        }
    `]
})
export class ReminderPickerComponent {
    @ViewChild('op') op!: Popover;
    @Output() saved = new EventEmitter<Date>();

    view = signal<'main' | 'custom'>('main');
    selectedNote = signal<Note | null>(null);
    selectedDate = new Date();
    selectedTime = '08:00';
    selectedRepeat = 'none';

    timeOptions = [
        { label: '8:00 a.m.', value: '08:00' },
        { label: '1:00 p.m.', value: '13:00' },
        { label: '6:00 p.m.', value: '18:00' },
        { label: '8:00 p.m.', value: '20:00' },
        { label: 'Personalizado...', value: 'custom' }
    ];

    repeatOptions = [
        { label: 'Sin repetición', value: 'none' },
        { label: 'Diariamente', value: 'daily' },
        { label: 'Semanalmente', value: 'weekly' },
        { label: 'Mensualmente', value: 'monthly' },
        { label: 'Anualmente', value: 'yearly' }
    ];

    private readonly noteService = inject(NoteService);

    show(event: Event, note: Note | null) {
        this.selectedNote.set(note);
        this.view.set('main'); // Siempre empezar en el menú principal
        
        if (note?.reminder) {
            this.selectedDate = new Date(note.reminder);
            const hours = this.selectedDate.getHours().toString().padStart(2, '0');
            const minutes = this.selectedDate.getMinutes().toString().padStart(2, '0');
            this.selectedTime = `${hours}:${minutes}`;
        } else {
            this.selectedDate = new Date();
            this.selectedDate.setDate(this.selectedDate.getDate() + 1);
            this.selectedTime = '08:00';
        }
        this.op.toggle(event);
    }

    setQuickReminder(type: 'today' | 'tomorrow' | 'nextWeek') {
        const now = new Date();
        const reminder = new Date();
        
        if (type === 'today') {
            reminder.setHours(20, 0, 0, 0);
            if (reminder < now) reminder.setDate(reminder.getDate() + 1);
        } else if (type === 'tomorrow') {
            reminder.setDate(reminder.getDate() + 1);
            reminder.setHours(8, 0, 0, 0);
        } else if (type === 'nextWeek') {
            const day = reminder.getDay();
            const diff = (day === 0 ? 1 : 8 - day); // Próximo lunes
            reminder.setDate(reminder.getDate() + diff);
            reminder.setHours(8, 0, 0, 0);
        }

        this.updateReminder(reminder);
    }

    private updateReminder(date: Date) {
        if (this.selectedNote()) {
            this.noteService.update(this.selectedNote()!.id, { reminder: date } as any).subscribe(() => {
                this.op.hide();
            });
        } else {
            this.saved.emit(date);
            this.op.hide();
        }
    }

    save() {
        const [hours, minutes] = this.selectedTime.split(':').map(Number);
        const finalDate = new Date(this.selectedDate);
        finalDate.setHours(hours, minutes, 0, 0);
        this.updateReminder(finalDate);
    }
}
