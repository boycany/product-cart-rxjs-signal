import { Component, inject } from '@angular/core';

import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-list',
  templateUrl: './product-list.component.html',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ProductDetailComponent, AsyncPipe],
})
export class ProductListComponent {
  pageTitle = 'Products';

  private productService = inject(ProductService);

  // readonly products$ = this.productService.products$.pipe(
  //   tap(() => console.log('products$ component pipeline')),
  //   catchError((err) => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );
  products = this.productService.products;
  errorMessage = this.productService.productsError;
  loading = this.productService.productsLoading;

  // Selected product id to highlight the entry
  // readonly selectedProductId$ = this.productService.productSelected$.pipe(
  //   tap(() => console.log('selectedProductId$ component pipeline')),
  //   shareReplay(),
  //   catchError((err) => {
  //     this.errorMessage = err;
  //     return EMPTY;
  //   })
  // );
  selectedProductId = this.productService.selectedProductId;

  onSelected(productId: number): void {
    this.productService.productSelected(productId);
  }
}
