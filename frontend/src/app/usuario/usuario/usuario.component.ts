import { CommonModule } from "@angular/common";
import { Component, EventEmitter, inject, Output, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { BasicService } from "@/app/service/basic.service";
import { UsuarioModel } from "../shared/usuario.model";

@Component({
    selector: 'app-usuario',
    standalone: true,
    imports: [
        CommonModule,
        DatePickerModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ConfirmDialogModule,
        // ToastModule
        DialogModule,
        InputTextModule
    ],
    providers: [
        BasicService
    ],
    templateUrl: './usuario.component.html',
})
export class UsuarioComponent {
    http = inject(BasicService);
    visible = signal<boolean>(false);
    entity = signal<UsuarioModel>(new UsuarioModel());
    formData: UsuarioModel = new UsuarioModel();
    @Output() messageEvent = new EventEmitter<boolean>();

    load(_entityId: number): void {
        this.formData = new UsuarioModel();
        if (_entityId > 0) {
            this.http.basePost(`usuariocontroller/getbyid/${_entityId}`, {}).subscribe({
                next: (data: UsuarioModel) => {
                    this.formData = { ...data, password: '' };
                    this.onDialogVisibleChange(true);
                },
                error: (err: any) => console.error('Error cargando usuario:', err)
            });
        } else {
            this.onDialogVisibleChange(true);
        }
    }

    saveChanges() {
        const isEdit = this.formData.id > 0;
        let payload: any;
        if (isEdit) {
            // Solo enviar campos del UpdateUsuarioDto (sin id, created_at, updated_at)
            payload = { name: this.formData.name, email: this.formData.email };
            if (this.formData.password) payload.password = this.formData.password;
        } else {
            payload = { name: this.formData.name, email: this.formData.email, password: this.formData.password };
        }
        const request$ = isEdit
            ? this.http.basePatch(`usuariocontroller/${this.formData.id}`, payload)
            : this.http.basePost('usuariocontroller/save', payload);

        request$.subscribe({
            next: (response: any) => {
                console.log('Save successful:', response);
                this.closeDialog();
                this.messageEvent.emit();
            },
            error: (err: any) => console.error('Error guardando usuario:', err)
        });
    }

    onDialogVisibleChange(value: boolean): void {
        this.visible.set(value);
    }

    closeDialog(): void {
        this.visible.set(false);
    }
}
