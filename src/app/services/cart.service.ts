import { Injectable } from '@angular/core';
import { HttpClient, HttpStatusCode } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { CART_ENDPOINTS } from '../api';

export interface CartItem {
    productId: number;
    quantity: number;
    price?: number;
    createdAt?: string;
}

export interface Cart {
    id?: number;
    userId?: number;
    items: CartItem[];
    status?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CartResponse {
    status: string;
    message: string;
    data: Cart;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {

    constructor(private http: HttpClient) { }

    checkCartExists(): Observable<{ exists: boolean; cart?: Cart }> {
        return this.http.get<CartResponse>(CART_ENDPOINTS.CHECK_EXISTS, { observe: 'response' }).pipe(
            map(response => {
                if (response.status === HttpStatusCode.NoContent) {
                    return { exists: false };
                }
                return { exists: true, cart: response.body?.data };
            }),
            catchError(error => {
                if (error.status === HttpStatusCode.NoContent) {
                    return of({ exists: false });
                }
                throw error;
            })
        );
    }

    createCart(items: CartItem[]): Observable<CartResponse> {
        return this.http.post<CartResponse>(CART_ENDPOINTS.CREATE, { items });
    }

    updateCart(items: CartItem[]): Observable<CartResponse> {
        return this.http.put<CartResponse>(CART_ENDPOINTS.UPDATE, { items });
    }

    addOrUpdateItem(existingCart: Cart | undefined, productId: number, quantity: number): CartItem[] {
        const items = existingCart?.items || [];
        const existingItemIndex = items.findIndex(item => item.productId === productId);

        if (existingItemIndex >= 0) {
            // Update existing item
            const updatedItems = [...items];
            updatedItems[existingItemIndex] = {
                ...updatedItems[existingItemIndex],
                quantity: updatedItems[existingItemIndex].quantity + quantity
            };
            return updatedItems;
        } else {
            // Add new item
            return [...items, { productId, quantity }];
        }
    }
}
