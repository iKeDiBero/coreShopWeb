import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    user: any;
    isSidebarOpen: boolean = true;

    constructor(
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                this.router.navigate(['/login']);
                return;
            }
            this.user = JSON.parse(userStr);
        }
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        this.router.navigate(['/login']);
    }

    toggleSidebar() {
        this.isSidebarOpen = !this.isSidebarOpen;
    }
}
