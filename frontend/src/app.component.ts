import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LayoutService } from './app/layout/service/layout.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule],
    template: `<router-outlet></router-outlet>`
})
export class AppComponent {
    // Inyectar LayoutService para que se inicialice y aplique el tema oscuro al arrancar
    readonly layoutService = inject(LayoutService);
}
