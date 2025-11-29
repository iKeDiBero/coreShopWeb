import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WarehouseService, WarehouseSummary, WarehouseProduct, PurchaseHistoryEntry } from '../../services/warehouse.service';

@Component({
    selector: 'app-warehouse',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './warehouse.component.html',
})
export class WarehouseComponent {
    summary: WarehouseSummary | null = null;
    products: WarehouseProduct[] = [];
    isLoading: boolean = true;
    errorMessage: string = '';
    
    // Para el modal de historial
    selectedProduct: WarehouseProduct | null = null;
    purchaseHistory: PurchaseHistoryEntry[] = [];
    isHistoryLoading: boolean = false;
    showHistoryModal: boolean = false;

    // Filtros y búsqueda
    searchTerm: string = '';
    selectedCategory: string = '';
    sortBy: string = 'quantity';
    sortOrder: 'asc' | 'desc' = 'desc';

    constructor(
        private warehouseService: WarehouseService,
        private cdr: ChangeDetectorRef
    ) {
        afterNextRender(() => {
            this.loadWarehouseData();
        });
    }

    loadWarehouseData() {
        this.isLoading = true;
        
        // Cargar resumen
        this.warehouseService.getWarehouseSummary().subscribe({
            next: (response) => {
                this.summary = response.data;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading warehouse summary', error);
            }
        });

        // Cargar productos
        this.warehouseService.getWarehouseProducts().subscribe({
            next: (response) => {
                this.products = response.data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading warehouse products', error);
                this.errorMessage = 'No se pudieron cargar los productos del almacén.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    get filteredProducts(): WarehouseProduct[] {
        let filtered = this.products;

        // Filtrar por búsqueda
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(term) ||
                p.sku?.toLowerCase().includes(term) ||
                p.brandName.toLowerCase().includes(term) ||
                p.modelName.toLowerCase().includes(term)
            );
        }

        // Filtrar por categoría
        if (this.selectedCategory) {
            filtered = filtered.filter(p => p.categoryName === this.selectedCategory);
        }

        // Ordenar
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (this.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'quantity':
                    comparison = a.quantity - b.quantity;
                    break;
                case 'value':
                    comparison = a.totalValue - b.totalValue;
                    break;
                case 'date':
                    comparison = new Date(a.lastPurchase).getTime() - new Date(b.lastPurchase).getTime();
                    break;
            }
            return this.sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }

    get categories(): string[] {
        const cats = new Set(this.products.map(p => p.categoryName));
        return Array.from(cats).sort();
    }

    onSearch(event: Event) {
        this.searchTerm = (event.target as HTMLInputElement).value;
    }

    onCategoryChange(event: Event) {
        this.selectedCategory = (event.target as HTMLSelectElement).value;
    }

    onSortChange(event: Event) {
        this.sortBy = (event.target as HTMLSelectElement).value;
    }

    toggleSortOrder() {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    }

    viewProductHistory(product: WarehouseProduct) {
        this.selectedProduct = product;
        this.showHistoryModal = true;
        this.isHistoryLoading = true;

        this.warehouseService.getProductHistory(product.productId).subscribe({
            next: (response) => {
                this.purchaseHistory = response.data;
                this.isHistoryLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading purchase history', error);
                this.isHistoryLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    closeHistoryModal() {
        this.showHistoryModal = false;
        this.selectedProduct = null;
        this.purchaseHistory = [];
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        }).format(value);
    }

    formatDate(dateString: string): string {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString: string): string {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
