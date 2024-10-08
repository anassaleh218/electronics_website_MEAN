import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { routes } from './app.routes';  // Your routes configuration
import { SharedModule } from './shared.module'  // Module containing your non-standalone components

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,   // Valid import
    HttpClientModule,               // Valid import
    SharedModule                    // Import NgModule for non-standalone components
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'electronics_website';
}
