import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginData = {
    email: '',
    password: '',
    keepLoggedIn: false,
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Check if the token and isAdmin cookie exist
    const token = this.getCookie('token');
    const isAdmin = this.getCookie('isAdmin');

    // If there is a token and the user is not an admin, redirect to home
    if (token && isAdmin === 'false') {
      this.router.navigate(['/home']);
    }
  }

  // Helper function to get a cookie by name
  getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      const cookieValue = parts.pop()?.split(';').shift();
      return cookieValue ? cookieValue : null; // Return null if cookieValue is undefined
    }
    return null; // Return null if the cookie was not found
  }

  // Method to handle the form submission
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
              document.cookie = `token=${response.token}; path=/`; // Added path for cookie
              document.cookie = `isAdmin=${response.isAdmin}; path=/`; // Added path for cookie
              document.cookie = `userName=${response.userName}; path=/`; // Added path for cookie

              // Navigate based on admin status
              if (response.isAdmin === false) {
                this.router.navigate(['/home']);
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
