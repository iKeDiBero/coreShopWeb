import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
    user: any;
    isSidebarOpen: boolean = true;
    pageTitle: string = 'Dashboard';

    constructor(
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe((event: any) => {
            this.updateTitle(event.url);
        });
    }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                this.router.navigate(['/login']);
                return;
            }
            this.user = JSON.parse(userStr);
        }
        this.updateTitle(this.router.url);
    }

    updateTitle(url: string) {
        if (url.includes('/profile')) {
            this.pageTitle = 'Mi Perfil';
        } else if (url.includes('/dashboard')) {
            this.pageTitle = 'Dashboard';
        } else {
            this.pageTitle = 'CoreShop';
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
