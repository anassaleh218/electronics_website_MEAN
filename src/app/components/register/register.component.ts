import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
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

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const { name, email, password } = this.registerForm.value;

    this.http.post('http://localhost:3000/api/user', { name, email, password })
      .subscribe(
        (response: any) => {
          if (response.token && response.isAdmin !== undefined) {
            document.cookie = `token=${response.token}`;
            document.cookie = `isAdmin=${response.isAdmin}`;
            document.cookie = `userName=${response.userName}`;
            this.router.navigate([response.isAdmin ? '/add-product' : '/products']);
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
