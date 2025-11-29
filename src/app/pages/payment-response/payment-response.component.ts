import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../api';

interface PaymentResult {
    orderId: number;
    previousStatus: string;
    newStatus: string;
    paymentSuccessful: boolean;
    message: string;
    transactionCode?: string;
    authorizationCode?: string;
    status?: string;
    cardBrand?: string;
    cardNumber?: string;
    amount?: number;
    actionCode?: string;
    traceNumber?: string;
}

@Component({
    selector: 'app-payment-response',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './payment-response.component.html',
})
export class PaymentResponseComponent implements OnInit {
    isLoading: boolean = true;
    paymentResult: PaymentResult | null = null;
    errorMessage: string = '';
    orderId: string | null = null;
    sessionId: string | null = null;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.processPaymentResponse();
        } else {
            this.isLoading = false;
        }
    }

    processPaymentResponse() {
        // Obtener parámetros de la URL
        this.orderId = this.route.snapshot.queryParamMap.get('orderId');
        this.sessionId = this.route.snapshot.queryParamMap.get('sessionId');
        
        // Parámetros que envía el backend después de procesar
        const success = this.route.snapshot.queryParamMap.get('success');
        const status = this.route.snapshot.queryParamMap.get('status');
        const authorizationCode = this.route.snapshot.queryParamMap.get('authorizationCode');
        const error = this.route.snapshot.queryParamMap.get('error');
        const cardBrand = this.route.snapshot.queryParamMap.get('cardBrand');
        const cardNumber = this.route.snapshot.queryParamMap.get('cardNumber');
        const amount = this.route.snapshot.queryParamMap.get('amount');
        const transactionCode = this.route.snapshot.queryParamMap.get('transactionCode');
        const actionCode = this.route.snapshot.queryParamMap.get('actionCode');
        const traceNumber = this.route.snapshot.queryParamMap.get('traceNumber');

        console.log('=== Payment Response Query Params ===');
        console.log('orderId:', this.orderId);
        console.log('success:', success);
        console.log('status:', status);
        console.log('authorizationCode:', authorizationCode);

        if (!this.orderId) {
            this.errorMessage = 'No se encontró el ID de la orden en la respuesta de pago.';
            this.isLoading = false;
            return;
        }

        // Si el backend ya procesó el pago y nos redirigió con el resultado
        if (success !== null || status !== null) {
            // status "completed" significa pago exitoso
            const isSuccess = success === 'true' || status === 'completed' || status === 'PAID';
            this.paymentResult = {
                orderId: parseInt(this.orderId),
                previousStatus: '',
                newStatus: status || '',
                paymentSuccessful: isSuccess,
                message: isSuccess 
                    ? '¡Tu pago ha sido procesado correctamente!' 
                    : (error ? decodeURIComponent(error) : 'El pago no fue autorizado'),
                authorizationCode: authorizationCode || undefined,
                status: status || undefined,
                cardBrand: cardBrand || undefined,
                cardNumber: cardNumber || undefined,
                amount: amount ? parseFloat(amount) : undefined,
                transactionCode: transactionCode || undefined,
                actionCode: actionCode || undefined,
                traceNumber: traceNumber || undefined
            };
            this.isLoading = false;
            return;
        }

        // Flujo anterior: cuando Niubiz redirige directamente aquí (mantener para compatibilidad)
        const queryParams = this.route.snapshot.queryParams;
        
        console.log('All params:', queryParams);

        const callbackData = {
            transactionToken: queryParams['transactionToken'] || null,
            transactionCode: queryParams['transactionCode'] || null,
            merchantId: queryParams['merchantId'] || null,
            purchaseNumber: queryParams['purchaseNumber'] || this.orderId,
            amount: queryParams['amount'] || null,
            currency: queryParams['currency'] || null,
            authorizationCode: queryParams['authorizationCode'] || null,
            actionCode: queryParams['actionCode'] || null,
            actionDescription: queryParams['actionDescription'] || null,
            errorCode: queryParams['errorCode'] || null,
            errorMessage: queryParams['errorMessage'] || null,
            traceNumber: queryParams['traceNumber'] || null,
            transactionDate: queryParams['transactionDate'] || null,
            transactionTime: queryParams['transactionTime'] || null,
            cardType: queryParams['cardType'] || null,
            cardBrand: queryParams['cardBrand'] || queryParams['brand'] || null,
            cardNumber: queryParams['cardNumber'] || queryParams['card'] || null,
            installmentsNumber: queryParams['installmentsNumber'] || null,
            signatureValue: queryParams['signatureValue'] || null
        };

        console.log('Callback data to send:', callbackData);
        
        let callbackUrl = `${API_BASE_URL}/orders/payment-callback?orderId=${this.orderId}`;
        if (this.sessionId) {
            callbackUrl += `&sessionId=${this.sessionId}`;
        }

        this.http.post<{ status: string; data: PaymentResult }>(callbackUrl, callbackData).subscribe({
            next: (response) => {
                this.paymentResult = response.data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error processing payment response', error);
                this.errorMessage = 'Error al procesar la respuesta de pago. Por favor, verifica tu orden.';
                this.isLoading = false;
            }
        });
    }

    goToOrders() {
        this.router.navigate(['/home/orders']);
    }

    goToHome() {
        this.router.navigate(['/home/dashboard']);
    }

    getStatusClass(): string {
        if (!this.paymentResult) return '';
        return this.paymentResult.paymentSuccessful 
            ? 'text-green-400' 
            : 'text-red-400';
    }

    getStatusIcon(): string {
        if (!this.paymentResult) return '⏳';
        return this.paymentResult.paymentSuccessful ? '✓' : '✗';
    }

    getStatusText(): string {
        if (!this.paymentResult) return '';
        const status = this.paymentResult.newStatus?.toLowerCase();
        switch (status) {
            case 'completed':
                return 'Completado';
            case 'paid':
                return 'Pagado';
            case 'pending':
                return 'Pendiente';
            case 'payment_failed':
                return 'Pago Fallido';
            case 'cancelled':
                return 'Cancelado';
            default:
                return this.paymentResult.newStatus || 'Desconocido';
        }
    }

    getCardBrandIcon(): string {
        if (!this.paymentResult?.cardBrand) return '💳';
        const brand = this.paymentResult.cardBrand.toLowerCase();
        switch (brand) {
            case 'visa':
                return '💳 Visa';
            case 'mastercard':
                return '💳 Mastercard';
            case 'amex':
            case 'american express':
                return '💳 Amex';
            case 'diners':
                return '💳 Diners';
            default:
                return '💳 ' + this.paymentResult.cardBrand;
        }
    }

    formatCurrency(amount: number | undefined): string {
        if (!amount) return '';
        return new Intl.NumberFormat('es-PE', { 
            style: 'currency', 
            currency: 'PEN' 
        }).format(amount);
    }

    getCurrentDate(): string {
        return new Date().toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}
