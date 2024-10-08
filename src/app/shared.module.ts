import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; 
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Import ReactiveFormsModule
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
// import { CheckoutComponent } from './components/checkout/checkout.component';
import { NgModule } from '@angular/core';
import { OrdersComponent } from './components/orders/orders.component';
import { RouterModule } from '@angular/router'; 
import { CookieService } from 'ngx-cookie-service'; 
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { ProductsComponent } from './components/products/products.component';
import { CardComponent } from './components/card/card.component';
@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    // CheckoutComponent,
    OrdersComponent,
    OrderDetailsComponent,
    ProductsComponent,
    CardComponent
  ],
  imports: [
    RouterOutlet, 
    CommonModule,
    FormsModule,          // For template-driven forms
    ReactiveFormsModule,
    RouterModule   // For reactive forms
  ],
  exports: [
    LoginComponent,
    RegisterComponent,

  ],
  providers: [CookieService], 
})
export class SharedModule { }
