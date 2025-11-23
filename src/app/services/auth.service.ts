import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AUTH_ENDPOINTS } from '../api';

export interface LoginResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    email: string;
    roles: string[];
    telefono: string;
    direccion: string;
    ciudad: string;
    pais: string;
    profilePhoto: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
    }
}
