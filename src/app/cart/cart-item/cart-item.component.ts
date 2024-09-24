import { Component, Input, computed, inject, input } from '@angular/core';
import { CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CartItem } from '../cart';
import { CartService } from '../cart.service';

@Component({
  selector: 'sw-cart-item',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, NgFor, NgIf],
  templateUrl: './cart-item.component.html',
})
export class CartItemComponent {
  private cartService = inject(CartService);

  /* Code before Angular v17 that not support input signal */
  // @Input({ required: true }) set cartItem(input: CartItem){
  //   console.log('input :>> ', input);
  //    this.item.set(input);
  // };
  // item = signal<CartItem>({} as CartItem);

  cartItem = input.required<CartItem>();

  // Quantity available (hard-coded to 8)
  // Mapped to an array from 1-8
  // qtyArr = [...Array(8).keys()].map((x) => x + 1);

  qtyArr = computed<number[]>(() =>
    [...Array(this.cartItem().product.quantityInStock).keys()].map((x) => x + 1)
  );

  // Calculate the extended price
  exPrice = computed(
    () => this.cartItem().quantity * this.cartItem().product.price
  );

  onQuantitySelected(quantity: number): void {
    // console.log('quantity :>> ', quantity);
    this.cartService.updateQuantity(this.cartItem(), quantity);
  }

  removeFromCart(): void {
    this.cartService.removeFromCart(this.cartItem());
  }
}
