import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
})
export class LoginComponent {
    loginForm: FormGroup;
    errorMessage: string = '';
    isLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.loginForm = this.fb.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading = true;
            this.errorMessage = '';

            this.authService.login(this.loginForm.value).subscribe({
                next: (response) => {
                    console.log('Login successful', response);
                    if (isPlatformBrowser(this.platformId)) {
                        localStorage.setItem('token', response.token);
                        localStorage.setItem('user', JSON.stringify(response));
                    }
                    this.isLoading = false;
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    console.error('Login failed', error);
                    this.isLoading = false;
                    if (error.status === 400) {
                        this.errorMessage = 'Credenciales inválidas. Por favor, inténtelo de nuevo.';
                    } else {
                        this.errorMessage = 'Ocurrió un error al iniciar sesión. Inténtelo más tarde.';
                    }
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
}
