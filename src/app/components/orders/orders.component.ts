import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-orders',
  // standalone: true,
  // imports: [],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  orders: any[] = [];
  token: string = ''; // Replace with your actual token logic


  constructor(private http: HttpClient,private cookieService: CookieService) {}

  ngOnInit(): void {
    this.token = this.cookieService.get('token');

    this.updateTable();
  }

  updateTable(): void {
    const url = 'http://127.0.0.1:3000/api/order/all';
    const headers = new HttpHeaders().set('x-auth-token', this.token);

    this.http.get<any[]>(url, { headers })
      .subscribe({
        next: (data) => {
          this.orders = data || [];
        },
        error: (error) => {
          console.error('Error fetching order details:', error);
        }
      });
  }
}