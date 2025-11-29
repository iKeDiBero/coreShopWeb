import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api';

export interface WarehouseSummary {
    totalProducts: number;
    uniqueProducts: number;
    totalValue: number;
    completedOrders: number;
    categorySummary: CategorySummary[];
}

export interface CategorySummary {
    categoryName: string;
    uniqueProducts: number;
    totalQuantity: number;
}

export interface WarehouseProduct {
    productId: number;
    name: string;
    description: string;
    sku: string;
    imageBase64: string | null;
    categoryName: string;
    brandName: string;
    modelName: string;
    quantity: number;
    avgPrice: number;
    totalValue: number;
    firstPurchase: string;
    lastPurchase: string;
}

export interface PurchaseHistoryEntry {
    orderId: number;
    quantity: number;
    price: number;
    purchaseDate: string;
    status: string;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class WarehouseService {
    
    constructor(private http: HttpClient) { }

    /**
     * Obtiene el resumen del almacén del usuario
     */
    getWarehouseSummary(): Observable<ApiResponse<WarehouseSummary>> {
        return this.http.get<ApiResponse<WarehouseSummary>>(`${API_BASE_URL}/warehouse/summary`);
    }

    /**
     * Obtiene todos los productos del almacén del usuario
     */
    getWarehouseProducts(): Observable<ApiResponse<WarehouseProduct[]>> {
        return this.http.get<ApiResponse<WarehouseProduct[]>>(`${API_BASE_URL}/warehouse/products`);
    }

    /**
     * Obtiene el historial de compras de un producto específico
     */
    getProductHistory(productId: number): Observable<ApiResponse<PurchaseHistoryEntry[]>> {
        return this.http.get<ApiResponse<PurchaseHistoryEntry[]>>(`${API_BASE_URL}/warehouse/products/${productId}/history`);
    }
}
