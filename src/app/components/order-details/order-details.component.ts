import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service'; // Make sure you have this package installed
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.component.html',
  styleUrls: ['./order-details.component.css']
})
export class OrderDetailsComponent implements OnInit {
  order: any;
  totalCost: number = 0;
  flatNo: string = '';
  buildingNo: string = '';
  street: string = '';
  city: string = '';
  paymentMethod: string = '';
  phone1: string = '';

  constructor(private http: HttpClient, private cookieService: CookieService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.updateTable();
  }

  async updateTable() {
    const orderId = this.route.snapshot.paramMap.get('id');

    if (!orderId) {
      console.error('Order ID not found in URL parameters.');
      return;
    }

    const url = `http://127.0.0.1:3000/api/order/${orderId}`;
    const token = this.cookieService.get('token'); // Replace with your actual cookie name
    const headers = new HttpHeaders().set('x-auth-token', token);

    this.http.get<any>(url, { headers }).subscribe({
      next: (data) => {
        // Data from API response
        const orderData = data.orderId;
        this.order = orderData;
        this.totalCost = data.totalCost;
        this.flatNo = data.flatNo;
        this.buildingNo = data.buildingNo;
        this.street = data.street;
        this.city = data.city;
        this.paymentMethod = data.paymentMethod;
        this.phone1 = data.phone1;
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
      }
    });
  }
}
