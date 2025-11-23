import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CartService, Cart } from '../../services/cart.service';
import { ProductService, Product } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
    cart: Cart | undefined;
    products: Product[] = [];
    isLoading: boolean = true;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(
        private cartService: CartService,
        private productService: ProductService,
        private orderService: OrderService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadCart();
            this.loadProducts();
        } else {
            this.isLoading = false;
        }
    }

    loadCart() {
        this.cartService.checkCartExists().subscribe({
            next: (result) => {
                this.cart = result.cart;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading cart', error);
                this.errorMessage = 'No se pudo cargar el carrito.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadProducts() {
        this.productService.getProducts().subscribe({
            next: (response) => {
                this.products = response.data;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading products', error);
            }
        });
    }

    getProduct(productId: number): Product | undefined {
        return this.products.find(p => p.id === productId);
    }

    get cartItems() {
        return this.cart?.items || [];
    }

    get hasCartItems(): boolean {
        return (this.cart?.items?.length || 0) > 0;
    }

    getCartTotal(): number {
        if (!this.cart?.items) return 0;
        return this.cart.items.reduce((total, item) => {
            return total + ((item.price || 0) * item.quantity);
        }, 0);
    }

    removeItem(productId: number) {
        if (!this.cart?.items) return;

        const updatedItems = this.cart.items.filter(item => item.productId !== productId);

        if (updatedItems.length === 0) {
            this.showError('El carrito debe tener al menos un producto');
            return;
        }

        this.cartService.updateCart(updatedItems).subscribe({
            next: (response) => {
                this.cart = response.data;
                this.showSuccess('Producto eliminado del carrito');
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error removing item', error);
                this.showError('Error al eliminar el producto');
            }
        });
    }

    updateQuantity(productId: number, newQuantity: number) {
        if (!this.cart?.items || newQuantity < 1) return;

        const updatedItems = this.cart.items.map(item => {
            if (item.productId === productId) {
                return { ...item, quantity: newQuantity };
            }
            return item;
        });

        this.cartService.updateCart(updatedItems).subscribe({
            next: (response) => {
                this.cart = response.data;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error updating quantity', error);
                this.showError('Error al actualizar la cantidad');
            }
        });
    }

    createOrder() {
        if (!this.cart?.items || this.cart.items.length === 0) {
            this.showError('El carrito está vacío');
            return;
        }

        this.isLoading = true;
        this.orderService.createOrderFromCart().subscribe({
            next: (response) => {
                this.showSuccess('Orden creada exitosamente');
                this.isLoading = false;
                // Recargar el carrito (debería estar vacío ahora)
                setTimeout(() => {
                    this.loadCart();
                    this.router.navigate(['/home/dashboard']);
                }, 2000);
            },
            error: (error) => {
                console.error('Error creating order', error);
                this.showError('Error al crear la orden');
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    showSuccess(message: string) {
        this.successMessage = message;
        setTimeout(() => {
            this.successMessage = '';
            this.cdr.detectChanges();
        }, 3000);
    }

    showError(message: string) {
        this.errorMessage = message;
        setTimeout(() => {
            this.errorMessage = '';
            this.cdr.detectChanges();
        }, 3000);
    }
}
