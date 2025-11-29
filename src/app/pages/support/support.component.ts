import { Component, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService, TicketResponse, TicketRequest } from '../../services/support.service';
import { WarehouseService, WarehouseProduct } from '../../services/warehouse.service';

@Component({
    selector: 'app-support',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './support.component.html',
})
export class SupportComponent {
    tickets: TicketResponse[] = [];
    myProducts: WarehouseProduct[] = [];
    isLoading: boolean = true;
    isSubmitting: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    
    // Filtro de estado
    statusFilter: string = '';
    
    // Modal de nuevo ticket
    showNewTicketModal: boolean = false;
    newTicket: TicketRequest = {
        productId: 0,
        subject: '',
        description: ''
    };
    
    // Contadores para actualizar el tiempo restante
    private intervalId: any;

    constructor(
        private supportService: SupportService,
        private warehouseService: WarehouseService,
        private cdr: ChangeDetectorRef
    ) {
        afterNextRender(() => {
            this.loadData();
            // Actualizar tiempo restante cada segundo
            this.intervalId = setInterval(() => {
                this.updateRemainingTime();
            }, 1000);
        });
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    loadData() {
        this.isLoading = true;
        
        // Cargar tickets
        this.loadTickets();
        
        // Cargar productos del almacén para el formulario
        this.warehouseService.getWarehouseProducts().subscribe({
            next: (response) => {
                this.myProducts = response.data;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading products', error);
            }
        });
    }

    loadTickets() {
        const status = this.statusFilter || undefined;
        this.supportService.getMyTickets(status).subscribe({
            next: (response) => {
                this.tickets = response.data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading tickets', error);
                this.errorMessage = 'No se pudieron cargar los tickets.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    onStatusFilterChange(event: Event) {
        this.statusFilter = (event.target as HTMLSelectElement).value;
        this.loadTickets();
    }

    openNewTicketModal() {
        this.newTicket = {
            productId: 0,
            subject: '',
            description: ''
        };
        this.showNewTicketModal = true;
    }

    closeNewTicketModal() {
        this.showNewTicketModal = false;
    }

    submitTicket() {
        if (!this.newTicket.productId || !this.newTicket.subject) {
            this.errorMessage = 'Por favor selecciona un producto y escribe un asunto.';
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';

        this.supportService.createTicket(this.newTicket).subscribe({
            next: (response) => {
                this.tickets.unshift(response.data);
                this.showNewTicketModal = false;
                this.isSubmitting = false;
                this.successMessage = 'Ticket creado exitosamente. Un técnico lo atenderá pronto.';
                setTimeout(() => {
                    this.successMessage = '';
                    this.cdr.detectChanges();
                }, 5000);
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error creating ticket', error);
                this.errorMessage = 'No se pudo crear el ticket. Intenta de nuevo.';
                this.isSubmitting = false;
                this.cdr.detectChanges();
            }
        });
    }

    updateRemainingTime() {
        let needsUpdate = false;
        
        this.tickets.forEach(ticket => {
            if (ticket.status === 'pending' && ticket.remainingSeconds > 0) {
                ticket.remainingSeconds--;
                needsUpdate = true;
                
                // Si llegó a 0, marcar como resuelto localmente y recargar
                if (ticket.remainingSeconds <= 0) {
                    ticket.status = 'resolved';
                    ticket.statusLabel = 'Resuelto';
                }
            }
        });
        
        if (needsUpdate) {
            this.cdr.detectChanges();
        }
    }

    formatRemainingTime(seconds: number): string {
        if (seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

    getStatusClass(status: string): string {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'in_progress':
                return 'bg-blue-500/20 text-blue-400';
            case 'resolved':
                return 'bg-green-500/20 text-green-400';
            default:
                return 'bg-slate-500/20 text-slate-400';
        }
    }

    get pendingCount(): number {
        return this.tickets.filter(t => t.status === 'pending').length;
    }

    get resolvedCount(): number {
        return this.tickets.filter(t => t.status === 'resolved').length;
    }
}
