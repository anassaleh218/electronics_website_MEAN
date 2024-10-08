import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../card/card.component';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  // standalone: true,
  // imports: [RouterOutlet, FormsModule, CardComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  title = '';
  category = '';
  sortBy = ''; // New property for sorting
  products: any[] = [];  // Store the products fetched from the API
  filteredProducts: any[] = []; // Store filtered products

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts();  // Fetch products on initialization
  }

  fetchProducts(): void {
    this.http.get<any[]>('http://localhost:3000/api/prod/').subscribe(
      (data) => {
        this.products = data;  // Assign the fetched products to the local variable
        this.filteredProducts = this.products; // Initialize filteredProducts
      },
      (error) => console.error('Error fetching products:', error)
    );
  }



  searchTitle(title: string) {
    this.filteredProducts = this.products.filter((product) => product.name.includes(title));
    console.log(this.title);
    this.sortProducts(); // Re-sort after filtering
  }

  searchCategory(category: string) {
    this.filteredProducts = this.products.filter((product) => product.category.includes(category));
    console.log(this.category);
    this.sortProducts(); // Re-sort after filtering
  }

  sortProducts() {
    if (this.sortBy === 'name_asc') {
      this.filteredProducts?.sort((a, b) => a.name.localeCompare(b.name));
    } else if (this.sortBy === 'name_desc') {
      this.filteredProducts?.sort((a, b) => b.name.localeCompare(a.name));
    } else if (this.sortBy === 'price_asc') {
      this.filteredProducts?.sort((a, b) => a.price - b.price);
    } else if (this.sortBy === 'price_desc') {
      this.filteredProducts?.sort((a, b) => b.price - a.price);
    }
  }

  // Optional: If you want to reset the filters
  resetFilters(): void {
    this.filteredProducts = this.products;  // Reset to the original product list
  }
}
