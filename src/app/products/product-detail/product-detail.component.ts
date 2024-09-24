import {
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { ProductService } from '../product.service';
import { CartService } from 'src/app/cart/cart.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  standalone: true,
  imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe],
})
export class ProductDetailComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Product to display
  product = this.productService.product;
  errorMessage = this.productService.productsError;
  loading = this.productService.productLoading;

  // product$ = this.productService.product$.pipe(
  //   tap(() => console.log('product$ in ProductDetail component pipeline')),
  //   catchError((err) => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );

  // Set the page title
  pageTitle = computed(() => {
    return this.product()
      ? `Product Detail for ${this.product()?.productName}`
      : 'Product Detail';
  });

  cartItems = this.cartService.cartItems;

  addToCart(product: Product) {
    if (this.isQuantityMax(product)) {
      alert('The quantity you added is already maximum!');
      return;
    }
    this.cartService.addToCart(product);
  }

  isQuantityMax(product: Product) {
    const matchedProduct = this.cartItems().find(
      (item) => item.product.id === product.id
    );
    if (!matchedProduct || !product.quantityInStock) {
      return false;
    } else {
      return matchedProduct.quantity >= product.quantityInStock;
    }
  }
}
