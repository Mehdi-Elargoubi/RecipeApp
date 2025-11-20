import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, UserData } from '../../services/auth/auth.service';
import { getFirestore, doc, setDoc } from '@angular/fire/firestore';

// Ajoute cet import en haut du fichier
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})


export class SignupComponent {
  signupForm: FormGroup;
  loading: boolean = false;
  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;
  photoBase64: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthDate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      photo: ['']
    });

    //   this.authService.getUser().subscribe(user => {
    //     if (user) {
    //       // Si déjà connecté, on redirige vers le dashboard
    //       this.router.navigate(['/dashboard']);
    //     }
    //  });

    // Vérifie une fois si l'utilisateur est déjà connecté (take(1))
    // On évite ainsi une redirection répétée à chaque changement d'authState
    this.authService.getUser()
      .pipe(take(1))
      .subscribe(user => {
        if (user) {
          // si déjà connecté -> redirection unique
          this.router.navigate(['/dashboard']);
        }
      });

  }

  // Prévisualisation photo et conversion en Base64
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result;
        this.photoBase64 = reader.result as string; // stocker en Base64
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async onSubmit() {
    if (this.signupForm.invalid) {
      alert('Veuillez remplir tous les champs correctement.');
      return;
    }

    this.loading = true;
    const { firstName, lastName, birthDate, email, password } = this.signupForm.value;

    const userData: UserData = { firstName, lastName, birthDate, email, password, photoURL: '' };

    this.authService.register(userData).subscribe({
      next: () => {
        this.loading = false;
        alert('Un email de vérification a été envoyé. Veuillez vérifier votre boîte mail avant de vous connecter.');
        this.router.navigate(['/login'], { state: { extraUserData: { firstName: userData.firstName, lastName: userData.lastName, birthDate: userData.birthDate } } }); // Rediriger vers la page de connexion
      },
      error: (error) => {
        console.error('Erreur inscription :', error);
        this.loading = false;
        alert('Erreur inscription : ' + error.message);
      }
    });
  }

  // async onSubmit() {
  //   if (this.signupForm.invalid) return;

  //   this.loading = true;

  //   const { firstName, lastName, birthDate, email, password } = this.signupForm.value;

  //   const userData: UserData = { firstName, lastName, birthDate, email, password, photoURL: '' };

  //   // Étape 1 : Créer l’utilisateur Firebase Auth
  //   this.authService.register(userData).subscribe({
  //     next: async () => {
  //       const user = await this.authService.currentUser();
  //       if (!user) {
  //         alert('Erreur : utilisateur non trouvé après inscription');
  //         this.loading = false;
  //         return;
  //       }

  //       // Étape 2 : Enregistrer infos dans Firestore (incluant image Base64)
  //       try {
  //         await setDoc(doc(getFirestore(), 'users', user.uid), {
  //           uid: user.uid,
  //           firstName,
  //           lastName,
  //           birthDate,
  //           email,
  //           photoBase64: this.photoBase64 || '', // Stocker l’image en Base64
  //           createdAt: new Date()
  //         });
  //       } catch (firestoreError) {
  //         console.error('Erreur Firestore :', firestoreError);
  //         alert('Utilisateur créé, mais échec de l’enregistrement dans Firestore');
  //       }

  //       this.loading = false;
  //       alert('Inscription réussie !');
  //       this.router.navigate(['/dashboard']);
  //     },
  //     error: (error) => {
  //       console.error('Erreur inscription :', error);
  //       this.loading = false;
  //       alert('Erreur inscription : ' + error.message);
  //     }
  //   });
  // }


  // async onSubmit() {
  //   if (this.signupForm.invalid) return;

  //   this.loading = true;
  //   const { firstName, lastName, birthDate, email, password } = this.signupForm.value;

  //   const userData: UserData = { firstName, lastName, birthDate, email, password, photoURL: '' };

  //   this.authService.register(userData).subscribe({
  //     next: async () => {
  //       const user = await this.authService.currentUser();
  //       if (!user) {
  //         alert('Erreur : utilisateur non trouvé après inscription');
  //         this.loading = false;
  //         return;
  //       }

  //       try {
  //         await setDoc(doc(getFirestore(), 'users', user.uid), {
  //           uid: user.uid,
  //           firstName,
  //           lastName,
  //           birthDate,
  //           email,
  //           photoBase64: this.photoBase64 || '',
  //           createdAt: new Date(),
  //           emailVerified: user.emailVerified
  //         });
  //       } catch (firestoreError) {
  //         console.error('Erreur Firestore :', firestoreError);
  //         alert('Utilisateur créé, mais échec de l’enregistrement dans Firestore');
  //       }

  //       this.loading = false;
  //       alert('✅ Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte avant de vous connecter.');
  //       this.router.navigate(['/login']); // ne pas aller sur dashboard tant qu’il n’a pas confirmé
  //     },
  //     error: (error) => {
  //       console.error('Erreur inscription :', error);
  //       this.loading = false;
  //       alert('Erreur inscription : ' + error.message);
  //     }
  //   });
  // }


}
