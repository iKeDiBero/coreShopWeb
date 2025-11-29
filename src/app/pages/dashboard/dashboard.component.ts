import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WarehouseService, WarehouseSummary } from '../../services/warehouse.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
    warehouseSummary: WarehouseSummary | null = null;
    isLoading: boolean = true;

    constructor(
        private warehouseService: WarehouseService,
        private cdr: ChangeDetectorRef
    ) {
        afterNextRender(() => {
            this.loadWarehouseSummary();
        });
    }

    loadWarehouseSummary() {
        this.warehouseService.getWarehouseSummary().subscribe({
            next: (response) => {
                this.warehouseSummary = response.data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading warehouse summary', error);
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        }).format(value);
    }
}
