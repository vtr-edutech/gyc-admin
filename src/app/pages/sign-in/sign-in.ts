import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-sign-in',
  imports: [CardModule, FloatLabel, InputText, Button, ReactiveFormsModule],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);

  signInForm: FormGroup = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    if (this.signInForm.valid) {
      const { username, password } = this.signInForm.value;
      this.authService.login({ userName: username, password }, response => {
        if (response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
          this.router.navigate(['/home']);
        }
      });
    } else {
      this.signInForm.markAllAsTouched();
    }
  }
}
