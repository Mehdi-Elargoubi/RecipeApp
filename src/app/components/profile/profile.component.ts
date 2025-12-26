import { Component, OnInit } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { updatePassword } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userData: any = null;
  profileForm: FormGroup;
  loading: boolean = false;

  selectedFile: File | null = null;
  photoBase64: string | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  isEditing: boolean = false;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private fb: FormBuilder
  ) {
    this.profileForm = this.fb.group({
      firstName: [{ value: '', disabled: true }, Validators.required],
      lastName: [{ value: '', disabled: true }, Validators.required],
      birthDate: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }],
      password: [{ value: '', disabled: true }] // nouveau mot de passe
    });
  }

  async ngOnInit() {
    await this.loadUser();
  }

  async loadUser() {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      this.userData = snap.data();

      this.profileForm.patchValue({
        firstName: this.userData.firstName,
        lastName: this.userData.lastName,
        birthDate: this.userData.birthDate,
        email: this.userData.email,
        password: '••••••' // afficher étoiles en lecture seule
      });

      this.photoBase64 = this.userData.photoBase64 || null;
      this.previewUrl = this.photoBase64;
    }
  }

  enableEditing() {
    this.isEditing = true;
    this.profileForm.get('firstName')?.enable();
    this.profileForm.get('lastName')?.enable();
    this.profileForm.get('birthDate')?.enable();
    this.profileForm.get('password')?.enable();
    this.profileForm.get('password')?.setValue(''); // vider pour changer
  }

  onFileSelected(event: any) {
    if (!this.isEditing) return;

    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Image trop grande (max 500 Ko)');
      return;
    }

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.photoBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async onSave() {
    if (this.profileForm.invalid) {
      alert('Veuillez remplir tous les champs.');
      return;
    }

    const user = this.auth.currentUser;
    if (!user) return;

    this.loading = true;
    const { firstName, lastName, birthDate, password } = this.profileForm.value;

    try {
      await setDoc(doc(this.firestore, 'users', user.uid), {
        ...this.userData,
        firstName,
        lastName,
        birthDate,
        photoBase64: this.photoBase64
      });

      if (password && password.length >= 6) {
        await updatePassword(user, password);
      } else if (password) {
        alert('Le mot de passe doit contenir au moins 6 caractères.');
      }

      alert('Profil mis à jour avec succès !');
      await this.loadUser();

      this.isEditing = false;
      this.profileForm.get('firstName')?.disable();
      this.profileForm.get('lastName')?.disable();
      this.profileForm.get('birthDate')?.disable();
      this.profileForm.get('password')?.disable();
    } catch (err: any) {
      console.error(err);
      alert('Erreur lors de la mise à jour du profil : ' + err.message);
    } finally {
      this.loading = false;
    }
  }

  onCancel() {
    this.isEditing = false;
    this.profileForm.patchValue({
      firstName: this.userData.firstName,
      lastName: this.userData.lastName,
      birthDate: this.userData.birthDate,
      password: '••••••'
    });
    this.profileForm.get('firstName')?.disable();
    this.profileForm.get('lastName')?.disable();
    this.profileForm.get('birthDate')?.disable();
    this.profileForm.get('password')?.disable();
    this.previewUrl = this.photoBase64;
  }

}
