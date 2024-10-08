import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
// import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OrderDetailsComponent } from './components/order-details/order-details.component';
import { ProductsComponent } from './components/products/products.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: 'checkout', component: CheckoutComponent },
  { path: 'orders', component: OrdersComponent},
  { path: 'order-details/:id', component: OrderDetailsComponent},
  { path: '', component: ProductsComponent}
];
