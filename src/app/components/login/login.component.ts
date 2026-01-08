import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;

    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        alert('Erreur de connexion : ' + err.message);
      }
    });
  }

  // 🔹 Connexion via Google
  async loginWithGoogle() {
    try {
      this.loading = true;
      const user = await this.authService.loginWithGoogle().toPromise();
      this.loading = false;
      console.log('Connecté avec Google :', user);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.loading = false;
      console.error(err);
      alert('Erreur Google : ' + err.message);
    }
  }

}
