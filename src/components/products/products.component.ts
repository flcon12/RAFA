import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Product, PRODUCTS } from '../../data/products';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgOptimizedImage],
})
export class ProductsComponent {
  products = signal<Product[]>(PRODUCTS);
  selectedCategory = signal<'premium' | 'volume' | 'nicho' | null>(null);
  cart = signal<number[]>([]);

  filteredProducts = computed(() => {
    const category = this.selectedCategory();
    if (category) {
      return this.products().filter(p => p.category === category);
    }
    return this.products();
  });

  categories = [
    { id: "volume", label: "Volume" },
    { id: "premium", label: "Premium" },
    { id: "nicho", label: "Nicho" },
  ] as const;
  
  selectCategory(category: 'premium' | 'volume' | 'nicho' | null): void {
    this.selectedCategory.set(category);
  }

  addToCart(productId: number): void {
    this.cart.update(ids => [...ids, productId]);
  }
}