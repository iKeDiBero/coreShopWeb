import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

// Declarar VisanetCheckout como global
declare var VisanetCheckout: any;

interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    productName: string;
    productDescription: string;
    productSku: string;
}

interface Order {
    id: number;
    userId: number;
    total: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    items: OrderItem[];
    itemCount: number;
}

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
    orders: Order[] = [];
    isLoading: boolean = true;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(
        private orderService: OrderService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadOrders();
        } else {
            this.isLoading = false;
        }
    }

    loadOrders() {
        this.orderService.getAllOrders().subscribe({
            next: (response) => {
                // El backend ahora retorna objetos estructurados directamente
                this.orders = response.data as Order[];
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading orders', error);
                this.errorMessage = 'No se pudieron cargar las órdenes.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    getStatusBadgeClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20';
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/20';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/20';
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
        }
    }

    getStatusText(status: string): string {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'Pendiente';
            case 'completed':
                return 'Completada';
            case 'cancelled':
                return 'Cancelada';
            default:
                return status;
        }
    }


    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    expandedOrderId: number | null = null;

    viewOrderDetails(orderId: number) {
        // Toggle: si ya está expandida, la cerramos; si no, la abrimos
        this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
    }

    isOrderExpanded(orderId: number): boolean {
        return this.expandedOrderId === orderId;
    }

    payOrder(order: Order) {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.orderService.generatePaymentToken(order.id).subscribe({
            next: (response) => {
                const paymentData = response.data;

                VisanetCheckout.configure({
                    sessiontoken: paymentData.sessionToken,
                    channel: 'web',
                    merchantid: paymentData.merchantId,
                    purchasenumber: order.id.toString(),
                    amount: paymentData.amount.toFixed(2),
                    expirationminutes: '20',
                    timeouturl: window.location.origin + '/home/orders',
                    merchantlogo: window.location.origin + '',
                    merchantname: 'CoreShop',
                    formbuttoncolor: '#6366f1',
                    action: window.location.origin + '',
                    complete: (params: any) => {
                        console.log('Pago completado:', params);
                        this.successMessage = 'Pago procesado exitosamente';
                        this.loadOrders();
                        this.isLoading = false;
                        this.cdr.detectChanges();
                    }
                });

                VisanetCheckout.open();
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error generating payment token', error);
                this.errorMessage = 'No se pudo iniciar el proceso de pago.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
