import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
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

  email = '';
  password = '';

  extraUserData?: { firstName?: string, lastName?: string, birthDate?: string };

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });

    // Read extra data from router state safely
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && 'extraUserData' in navigation.extras.state) {
      this.extraUserData = navigation.extras.state['extraUserData'] as {
        firstName?: string,
        lastName?: string,
        birthDate?: string
      };
    }
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password, this.extraUserData).subscribe({
      next: () => {
        this.loading = false;
        //alert('Connexion réussie !');
        //console.log('Connecté');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur de connexion : ', error);
        alert('Erreur de connexion : ' + error.message);
      }
    });
  }

  // async login() {
  //   this.authService.login(this.email, this.password).subscribe({
  //     next: res => {
  //       console.log('Connecté', res);
  //       this.router.navigate(['/']); // ou autre route sécurisée
  //     },
  //     error: err => alert('Erreur de connexion: ' + err.message)
  //   });
  // }

  // async register() {
  //   this.authService.register({ email: this.email, password: this.password }).subscribe({
  //     next: res => {
  //       alert('Compte créé');
  //       this.router.navigate(['/']);
  //     },
  //     error: err => alert('Erreur inscription: ' + err.message)
  //   });
  // }

  // async reset() {
  //   this.authService.resetPassword(this.email).subscribe({
  //     next: () => alert('Email de réinitialisation envoyé'),
  //     error: err => alert('Erreur: ' + err.message)
  //   });
  // }


  // async loginWithGoogle() {
  //   this.authService.loginWithGoogle().subscribe({
  //     next: res => {
  //       console.log('Google login', res);
  //       this.router.navigate(['/']);
  //     },
  //     error: err => alert('Erreur Google: ' + err.message)
  //   });
  // }

}
