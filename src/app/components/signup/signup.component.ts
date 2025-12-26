import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserData } from '../../services/auth/auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  signupForm: FormGroup;
  loading = false;
  previewUrl: string | ArrayBuffer | null = null;
  photoBase64: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 1000 * 1024) {
      alert('Image trop grande (max 1 Mo)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.photoBase64 = reader.result as string;
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.signupForm.invalid || !this.photoBase64) {
      alert('Formulaire incomplet ou image manquante');
      return;
    }

    this.loading = true;
    const { firstName, lastName, birthDate, email, password } = this.signupForm.value;

    const userData: UserData = { firstName, lastName, birthDate, email, password, photoBase64: this.photoBase64 };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        alert('Inscription réussie ! Vérifiez votre email.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        alert('Erreur : ' + err.message);
      }
    });
  }

  // 🔹 Signup / Login Google
  async signupWithGoogle() {
    try {
      this.loading = true;
      const user = await this.authService.loginWithGoogle().toPromise();
      this.loading = false;
      console.log('Inscrit via Google :', user);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.loading = false;
      alert('Erreur Google : ' + err.message);
    }
  }
}
