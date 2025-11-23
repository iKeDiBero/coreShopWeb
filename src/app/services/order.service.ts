import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ORDER_ENDPOINTS } from '../api';

export interface OrderResponse {
    status: string;
    message: string;
    data: any;
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
}
