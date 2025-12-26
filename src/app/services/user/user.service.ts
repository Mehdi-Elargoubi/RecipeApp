import { Injectable } from '@angular/core';
import { Firestore, doc, docData, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private firestore: Firestore, private auth: Auth) {}

  getUserProfile(): Observable<any> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Utilisateur non connecté');

    const ref = doc(this.firestore, 'users', uid);
    return docData(ref);
  }

  updateProfile(data: any) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(this.firestore, 'users', uid);
    return updateDoc(ref, data);
  }
}
