import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ProductsComponent } from './pages/products/products.component';
import { CartComponent } from './pages/cart/cart.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { PaymentResponseComponent } from './pages/payment-response/payment-response.component';
import { WarehouseComponent } from './pages/warehouse/warehouse.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'payment-response', component: PaymentResponseComponent },
    {
        path: 'home',
        component: HomeComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'profile', component: ProfileComponent },
            { path: 'products', component: ProductsComponent },
            { path: 'cart', component: CartComponent },
            { path: 'orders', component: OrdersComponent },
            { path: 'warehouse', component: WarehouseComponent },
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];
