import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      alert('Veuillez entrer une adresse email valide.');
      return;
    }

    this.loading = true;
    const { email } = this.forgotPasswordForm.value;

    this.authService.resetPassword(email).subscribe({
      next: () => {
        this.loading = false;
        alert('Un email de réinitialisation de mot de passe a été envoyé. Veuillez vérifier votre boîte mail.');
        this.forgotPasswordForm.reset();
      },
      error: (error) => {
        this.loading = false;
        console.error('Erreur lors de la réinitialisation du mot de passe :', error);
        alert('Erreur : ' + error.message);
      }
    });
  }
}
