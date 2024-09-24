import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Product, Result } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';

  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  // private productSelectedSubject = new BehaviorSubject<number | undefined>(
  //   undefined
  // );
  // readonly productSelected$ = this.productSelectedSubject.asObservable();
  /** We only care about the current value of selected product id, so we can use toObservable to get it */
  selectedProductId = signal<number | undefined>(undefined);
  productSelected$ = toObservable(this.selectedProductId);

  private productsResult$ = this.getProducts();
  productsResult = toSignal(this.productsResult$, {
    initialValue: { data: [] },
  });

  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);

  /** try...catch... to do Error Handling */
  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, { initialValue: [] })();
  //   } catch (err) {
  //     return [];
  //   }
  // });

  private productResult$ = this.productSelected$.pipe(
    filter(Boolean),
    tap((id) => console.log('product$ in ProductService pipeline: >> ', id)),
    switchMap((id) => {
      const productUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productUrl).pipe(
        switchMap((product) => this.getProductWithReviews(product)),
        catchError((err) =>
          of({
            data: undefined,
            error: this.errorService.formatError(err),
          } as Result<Product>)
        )
      );
    }),
    map((product) => ({ data: product } as Result<Product>))
  );
  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);

  //Alternative approach with product, because products$ using cache, so it will be a bit faster
  // readonly product$ = combineLatest([
  //   this.productSelected$,
  //   this.products$,
  // ]).pipe(
  //   map(([selectedProductId, products]) =>
  //     products.find((p) => p.id === selectedProductId)
  //   ),
  //   filter(Boolean),
  //   switchMap((product) => this.getProductWithReviews(product)),
  //   catchError((err) => this.handleError(err))
  // );

  getProducts(): Observable<Result<Product[]>> {
    return this.http.get<Product[]>(this.productsUrl).pipe(
      map((p) => ({ data: p } as Result<Product[]>)),
      tap((data) => console.log(JSON.stringify(data))),
      shareReplay(1),
      tap(() => console.log('After shareReplay')),
      catchError((err) => this.handleError(err))
    );
  }

  getProduct(id: number): Observable<Product> {
    const productUrl = `${this.productsUrl}/${id}`;
    return this.http.get<Product>(productUrl).pipe(
      tap(() => console.log('product get by id pipeline')),
      switchMap((product) => this.getProductWithReviews(product)),
      catchError((err) => this.handleError(err))
    );
  }

  productSelected(selectedProductId: number): void {
    // this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
  }

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http
        .get<Review[]>(this.reviewService.getReviewUrl(product.id))
        .pipe(
          map((reviews) => {
            return { ...product, reviews };
          })
        );
    } else {
      return of(product);
    }
  }

  private handleError(err: HttpErrorResponse): Observable<any> {
    // throw this.errorService.formatError(err);
    return of({ data: [], error: this.errorService.formatError(err) });
  }
}
