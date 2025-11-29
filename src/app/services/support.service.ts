import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../api';

export interface TicketRequest {
    productId: number;
    subject: string;
    description: string;
}

export interface TicketResponse {
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    subject: string;
    description: string;
    status: string;
    statusLabel: string;
    createdAt: string;
    resolvedAt: string | null;
    scheduledResolutionAt: string;
    remainingSeconds: number;
}

export interface ApiResponse<T> {
    status: string;
    data: T;
}

@Injectable({
    providedIn: 'root'
})
export class SupportService {
    
    constructor(private http: HttpClient) { }

    createTicket(request: TicketRequest): Observable<ApiResponse<TicketResponse>> {
        return this.http.post<ApiResponse<TicketResponse>>(`${API_BASE_URL}/support/tickets`, request);
    }

    getMyTickets(status?: string): Observable<ApiResponse<TicketResponse[]>> {
        let url = `${API_BASE_URL}/support/tickets`;
        if (status) {
            url += `?status=${status}`;
        }
        return this.http.get<ApiResponse<TicketResponse[]>>(url);
    }

    getTicketById(id: number): Observable<ApiResponse<TicketResponse>> {
        return this.http.get<ApiResponse<TicketResponse>>(`${API_BASE_URL}/support/tickets/${id}`);
    }
}
