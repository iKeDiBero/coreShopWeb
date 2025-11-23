import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PRODUCT_ENDPOINTS } from '../api';

export interface Product {
    id: number;
    name: string;
    description: string;
    metricUnit: string | null;
    weight: number;
    price: number;
    stock: number;
    category: string | null;
    barcode: string;
    imageBase64: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    categoryId: number;
    categoryName: string;
    metricUnitId: number;
    metricUnitName: string;
    sku: string;
    brandId: number;
    brandName: string;
    modelId: number;
    modelName: string;
    productCondition: string;
    specs: any;
    pricePerMonth: number | null;
    deviceId: number | null;
}

export interface ProductsResponse {
    status: string;
    message: string;
    data: Product[];
}

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private http: HttpClient) { }

    getProducts(): Observable<ProductsResponse> {
        return this.http.get<ProductsResponse>(PRODUCT_ENDPOINTS.LIST);
    }
}
