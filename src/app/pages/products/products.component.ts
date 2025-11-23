import { Component, OnInit, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ProductService, Product } from '../../services/product.service';
import { CartService, Cart } from '../../services/cart.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
    products: Product[] = [];
    cart: Cart | undefined;
    isLoading: boolean = true;
    errorMessage: string = '';
    successMessage: string = '';

    constructor(
        private productService: ProductService,
        private cartService: CartService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.loadProducts();
            this.loadCart();
        } else {
            this.isLoading = false;
        }
    }

    MoveToCart() {
        this.router.navigate(['/home/cart']);
    }

    loadProducts() {
        this.productService.getProducts().subscribe({
            next: (response) => {
                this.products = response.data;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading products', error);
                this.errorMessage = 'No se pudieron cargar los productos.';
                this.isLoading = false;
                this.cdr.detectChanges();
            }
        });
    }

    loadCart() {
        this.cartService.checkCartExists().subscribe({
            next: (result) => {
                this.cart = result.cart;
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error checking cart', error);
            }
        });
    }

    addToCart(productId: number) {
        const items = this.cartService.addOrUpdateItem(this.cart, productId, 1);

        if (this.cart?.id) {
            // Update existing cart
            this.cartService.updateCart(items).subscribe({
                next: (response) => {
                    this.cart = response.data;
                    this.showSuccess('Producto agregado al carrito');
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error updating cart', error);
                    this.showError('Error al actualizar el carrito');
                }
            });
        } else {
            // Create new cart
            this.cartService.createCart(items).subscribe({
                next: (response) => {
                    this.cart = response.data;
                    this.showSuccess('Producto agregado al carrito');
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    console.error('Error creating cart', error);
                    this.showError('Error al crear el carrito');
                }
            });
        }
    }

    getCartItemCount(): number {
        if (!this.cart?.items) return 0;
        return this.cart.items.reduce((total, item) => total + item.quantity, 0);
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
