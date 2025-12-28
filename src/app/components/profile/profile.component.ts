import { Component, OnInit } from '@angular/core';
import { Auth, updatePassword } from '@angular/fire/auth';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userData: any = null;
  profileForm: FormGroup;
  loading = false;

  photoBase64: string | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  isEditing = false;

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
      password: [{ value: '', disabled: true }]
    });
  }

  async ngOnInit() {
    await this.loadUser();
  }

  async loadUser() {
    const user = this.auth.currentUser;
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    this.userData = snap.data();

    this.profileForm.patchValue({
      firstName: this.userData.firstName,
      lastName: this.userData.lastName,
      birthDate: this.userData.birthDate,
      email: this.userData.email,
      password: '••••••'
    });

    this.photoBase64 = this.userData.photoBase64 || null;
    this.previewUrl = this.photoBase64;
  }

  enableEditing() {
    this.isEditing = true;
    ['firstName', 'lastName', 'birthDate', 'password'].forEach(f => {
      this.profileForm.get(f)?.enable();
    });
    this.profileForm.get('password')?.setValue('');
  }

  onFileSelected(event: any) {
    if (!this.isEditing) return;

    const file = event.target.files[0];
    if (!file || file.size > 500 * 1024) {
      alert('Image trop grande (max 500 Ko)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
      this.photoBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async onSave() {
    if (this.profileForm.invalid) return;

    const user = this.auth.currentUser;
    if (!user) return;

    this.loading = true;

    const { firstName, lastName, birthDate, password } = this.profileForm.value;

    try {
      await updateDoc(doc(this.firestore, 'users', user.uid), {
        firstName,
        lastName,
        birthDate,
        photoBase64: this.photoBase64
      });

      if (password) {
        if (password.length < 6) {
          alert('Mot de passe ≥ 6 caractères');
        } else {
          await updatePassword(user, password);
        }
      }

      alert('Profil mis à jour ✔');
      this.isEditing = false;
      await this.loadUser();

      ['firstName', 'lastName', 'birthDate', 'password'].forEach(f => {
        this.profileForm.get(f)?.disable();
      });

    } catch (err: any) {
      alert('Erreur : ' + err.message);
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

    ['firstName', 'lastName', 'birthDate', 'password'].forEach(f => {
      this.profileForm.get(f)?.disable();
    });

    this.previewUrl = this.photoBase64;
  }
}
