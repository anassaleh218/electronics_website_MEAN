import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if the token exists and if the user is not an admin
    const token = this.getCookie('token');
    const isAdmin = this.getCookie('isAdmin');

    // Redirect to home if token exists and isAdmin is false
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

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const { name, email, password } = this.registerForm.value;

    this.http.post('http://localhost:3000/api/user', { name, email, password })
      .subscribe(
        (response: any) => {
          if (response.token && response.isAdmin !== undefined) {
            document.cookie = `token=${response.token}; path=/`; // Added path for cookie
            document.cookie = `isAdmin=${response.isAdmin}; path=/`; // Added path for cookie
            document.cookie = `userName=${response.userName}; path=/`; // Added path for cookie
            
            // Navigate based on admin status
            this.router.navigate([response.isAdmin ? '/add-product' : '/home']);
          }
        },
        (error) => {
          console.error('Error:', error);
          // Display error message to the user
          alert(error.error.message || 'An unknown error occurred');
        }
      );
  }
}
