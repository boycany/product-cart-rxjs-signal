import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem } from './cart';
import { Product } from '../products/product';
import * as e from 'express';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems = signal<CartItem[]>([]);

  cartCount = computed(() =>
    this.cartItems().reduce((accQty, item) => {
      return accQty + item.quantity;
    }, 0)
  );

  subtotal = computed(() =>
    this.cartItems().reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    )
  );

  deliveryFee = computed<number>(() => (this.subtotal() < 50 ? 5.99 : 0));

  tax = computed(() => Math.round((this.subtotal() * 10.75) / 100));

  totalPrice = computed(
    () => this.subtotal() + this.tax() + this.deliveryFee()
  );

  // eLength = effect(() =>
  //   console.log('Cart array length :>> ', this.cartItems().length)
  // );

  // eCount = effect(() => console.log('Cart count :>> ', this.cartCount()));
  // eSubTotal = effect(() => console.log('Cart sub total :>> ', this.subtotal()));
  // eTax = effect(() => console.log('Cart tax :>> ', this.tax()));
  // eDeliveryFee = effect(() =>
  //   console.log('Cart delivery fee :>> ', this.deliveryFee())
  // );
  // eTotalPrice = effect(() =>
  //   console.log('Cart total price :>> ', this.totalPrice())
  // );
  // eCartItems = effect(() => console.log('Cart items :>> ', this.cartItems()));

  addToCart(product: Product): void {
    const index = this.cartItems().findIndex(
      (item) => item.product.id === product.id
    );

    if (index === -1) {
      this.cartItems.update((items) => [...items, { product, quantity: 1 }]);
    } else {
      this.cartItems.update((items) =>
        items.map((item, i) =>
          i === index ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    }
  }

  removeFromCart(carItem: CartItem): void {
    this.cartItems.update((items) => {
      return items.filter((item) => item.product.id !== carItem.product.id);
    });
  }

  updateQuantity(carItem: CartItem, quantity: number): void {
    this.cartItems.update((items) => {
      return items.map((item) => {
        if (item.product.id === carItem.product.id) {
          return { ...item, quantity };
        } else {
          return item;
        }
      });
    });
  }
}
