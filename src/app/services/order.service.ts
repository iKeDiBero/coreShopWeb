import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ORDER_ENDPOINTS } from '../api';

export interface OrderResponse {
    status: string;
    message: string;
    data: any;
}

export interface PaymentCallbackData {
    transactionToken?: string;
    transactionCode?: string;
    purchaseNumber?: string;
    amount?: string;
    actionCode?: string;
    actionDescription?: string;
    authorizationCode?: string;
    cardBrand?: string;
    cardNumber?: string;
}

@Injectable({
    providedIn: 'root'
})
export class OrderService {

    constructor(private http: HttpClient) { }

    createOrderFromCart(): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(ORDER_ENDPOINTS.CREATE_FROM_CART, {});
    }

    getAllOrders(): Observable<OrderResponse> {
        return this.http.get<OrderResponse>(ORDER_ENDPOINTS.GET_ALL);
    }

    generatePaymentToken(orderId: number): Observable<OrderResponse> {
        return this.http.post<OrderResponse>(`${ORDER_ENDPOINTS.GET_ALL}/${orderId}/payment-token`, {});
    }

    /**
     * Procesa el callback de pago enviando los datos de la transacción al backend
     * para autorizar el pago con Niubiz
     */
    processPaymentCallback(orderId: number, sessionId: string, callbackData: PaymentCallbackData): Observable<OrderResponse> {
        let url = `${ORDER_ENDPOINTS.PAYMENT_CALLBACK}?orderId=${orderId}`;
        if (sessionId) {
            url += `&sessionId=${sessionId}`;
        }
        return this.http.post<OrderResponse>(url, callbackData);
    }
}
