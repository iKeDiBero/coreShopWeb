import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { USER_ENDPOINTS } from '../api';

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    telefono: string;
    direccion: string;
    ciudad: string;
    pais: string;
    profilePhoto: string;
}

export interface ProfileResponse {
    status: string;
    message: string;
    data: UserProfile;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) { }

    getProfile(): Observable<ProfileResponse> {
        return this.http.get<ProfileResponse>(USER_ENDPOINTS.PROFILE);
    }
}
