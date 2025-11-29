import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { OrderService, PaymentCallbackData } from '../../services/order.service';
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

        // Generar un ID de sesión único para métodos de pago con redirección (como Cuotéalo)
        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        this.orderService.generatePaymentToken(order.id).subscribe({
            next: (response) => {
                const paymentData = response.data;

                // URL de respuesta con orderId y sessionId para identificar la transacción
                const paymentResponseUrl = `${window.location.origin}/payment-response?orderId=${order.id}&sessionId=${sessionId}`;

                VisanetCheckout.configure({
                    sessiontoken: paymentData.sessionToken,
                    channel: 'web',
                    merchantid: paymentData.merchantId,
                    purchasenumber: order.id.toString(),
                    amount: paymentData.amount.toFixed(2),
                    expirationminutes: '20',
                    timeouturl: `${window.location.origin}/home/orders`,
                    merchantlogo: `${window.location.origin}/assets/logo.png`,
                    merchantname: 'CoreShop',
                    formbuttoncolor: '#6366f1',
                    // Action apunta al backend que procesará el POST de Niubiz
                    // Después el backend redirigirá al frontend con el resultado
                    action: `http://localhost:8081/api/orders/niubiz-callback?orderId=${order.id}&sessionId=${sessionId}&amount=${paymentData.amount}`,
                    complete: (params: any) => {
                        console.log('=== VisanetCheckout Complete Callback ===');
                        console.log('Full params object:', JSON.stringify(params, null, 2));
                        console.log('Params keys:', Object.keys(params || {}));
                        
                        // Intentar obtener el token de diferentes propiedades posibles
                        const transactionToken = params?.transactionToken || 
                                                 params?.token || 
                                                 params?.tokenId ||
                                                 params?.transactionId ||
                                                 null;
                        
                        console.log('Transaction Token found:', transactionToken);
                        
                        // El transactionToken viene en el callback
                        // Necesitamos enviarlo al backend para autorizar la transacción
                        if (transactionToken) {
                            this.authorizePayment(order.id, transactionToken, paymentData.amount, sessionId);
                        } else {
                            // Si llegamos aquí sin token, es porque Niubiz redirigió al action
                            // El backend manejará el procesamiento
                            console.log('No token in complete callback - Niubiz will redirect to action URL');
                        }
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

    /**
     * Autoriza el pago enviando el transactionToken al backend
     */
    private authorizePayment(orderId: number, transactionToken: string, amount: number, sessionId: string) {
        this.isLoading = true;
        
        const callbackData: PaymentCallbackData = {
            transactionToken: transactionToken,
            purchaseNumber: orderId.toString(),
            amount: amount.toString()
        };

        console.log('=== Sending authorization request ===');
        console.log('Order ID:', orderId);
        console.log('Transaction Token:', transactionToken);
        console.log('Amount:', amount);

        this.orderService.processPaymentCallback(orderId, sessionId, callbackData).subscribe({
            next: (response: any) => {
                console.log('Authorization response:', response);
                if (response.data.paymentSuccessful) {
                    this.successMessage = 'Pago procesado exitosamente';
                } else {
                    this.errorMessage = response.data.message || 'El pago no fue autorizado';
                }
                this.loadOrders();
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error: any) => {
                console.error('Error authorizing payment:', error);
                this.errorMessage = 'Error al autorizar el pago. Por favor, verifica tu orden.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }
}
