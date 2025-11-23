import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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

    constructor(
        private userService: UserService,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.userService.getProfile().subscribe({
                next: (response) => {
                    console.log('Profile loaded:', response);
                    this.profile = response.data;
                    this.isLoading = false;
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error fetching profile', error);
                    this.errorMessage = 'No se pudo cargar la información del perfil.';
                    this.isLoading = false;
                    this.cdr.detectChanges();
                }
            });
        } else {
            this.isLoading = false;
        }
    }
}
