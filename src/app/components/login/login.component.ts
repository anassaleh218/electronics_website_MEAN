import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginData = {
    email: '',
    password: '',
    keepLoggedIn: false,
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(loginForm: any) {
    if (loginForm.valid) {
      this.http
        .post('http://localhost:3000/api/auth', {
          email: this.loginData.email,
          password: this.loginData.password,
        })
        .subscribe(
          (response: any) => {
            // Log the response for debugging purposes
            console.log('Server response:', response);
            
            // Check for required properties in the response
            if (response.token && response.isAdmin !== undefined && response.userName) {
              // Set cookies
              document.cookie = `token=${response.token}`;
              document.cookie = `isAdmin=${response.isAdmin}`;
              document.cookie = `userName=${response.userName}`;

              // Navigate based on admin status
              if (response.isAdmin === false) {
                this.router.navigate(['/products']);
              } else {
                this.router.navigate(['/add-product']);
              }
            } else {
              console.error('Invalid response:', response);
              // Optionally show an error message to the user
              alert('Login failed: Invalid response from server.');
            }
          },
          (error) => {
            console.error('Error logging in:', error);
            // Optionally show an error message to the user
            alert('Login failed: Please check your credentials and try again.');
          }
        );
    }
  }
}
