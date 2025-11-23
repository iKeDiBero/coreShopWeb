import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, UserProfile } from '../../services/user.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
    profile: UserProfile | null = null;
    isLoading: boolean = true;
    errorMessage: string = '';

    constructor(private userService: UserService) { }

    ngOnInit() {
        this.userService.getProfile().subscribe({
            next: (response) => {
                this.profile = response.data;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Error fetching profile', error);
                this.errorMessage = 'No se pudo cargar la información del perfil.';
                this.isLoading = false;
            }
        });
    }
}
