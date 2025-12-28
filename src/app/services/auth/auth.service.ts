import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import {
  Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  signOut, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail,
  authState
} from '@angular/fire/auth';
import { from, map, Observable, tap } from 'rxjs';
import { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore';
import { getDoc, setDoc, doc } from 'firebase/firestore';

import { sendEmailVerification } from '@angular/fire/auth';

export interface UserData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  password: string;
  photoBase64?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore, private storage: Storage) { }

  // État de l’utilisateur
  getUser(): Observable<any> {
    return authState(this.auth);
  }

  // Observable de l'état d'auth (null ou User)
  authState(): Observable<FirebaseUser | null> {
    return new Observable(sub => {
      return this.auth.onAuthStateChanged(user => sub.next(user));
    });
  }

  // 📝 Inscription (Firestore uniquement)
  register(userData: UserData): Observable<void> {
    const { firstName, lastName, birthDate, email, password, photoBase64 } = userData;

    return from(
      createUserWithEmailAndPassword(this.auth, email, password)
        .then(async cred => {
          const user = cred.user;

          await updateProfile(user, {
            displayName: `${firstName} ${lastName}`
          });

          // Sauvegarde Firestore
          await setDoc(doc(this.firestore, 'users', user.uid), {
            uid: user.uid,
            firstName,
            lastName,
            birthDate,
            email,
            photoBase64: photoBase64 || '',
            role: 'user', // ✅ rôle par défaut
            createdAt: new Date()
          });

          await sendEmailVerification(user);
        })
    );
  }

  // Connexion Email / Password
  login(email: string, password: string, extraData?: { birthDate?: string, firstName?: string, lastName?: string }): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(async (cred) => {
        const user = cred.user;

        if (!user.emailVerified) {
          throw new Error('Veuillez vérifier votre email avant de vous connecter.');
        }

        const userRef = doc(this.firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data()?.['role']) {
          await setDoc(
            userRef,
            {
              uid: user.uid,
              firstName: user.displayName?.split(' ')[0] || '',
              lastName: user.displayName?.split(' ')[1] || '',
              birthDate: extraData?.birthDate || '',
              email: user.email,
              photoURL: user.photoURL || null,
              role: 'user', // ✅ rôle ajouté si absent
              createdAt: new Date()
            },
            { merge: true }
          );
        }
      })
    );
  }

  // Connexion / Inscription Google (popup)
  loginWithGoogle(extraData?: { birthDate?: string, firstName?: string, lastName?: string }): Observable<FirebaseUser> {
    const provider = new GoogleAuthProvider();

    return from(signInWithPopup(this.auth, provider)).pipe(
      tap(async (cred) => {
        const user = cred.user;

        if (!user.emailVerified) {
          throw new Error('Veuillez vérifier votre email Google avant de vous connecter.');
        }

        const userRef = doc(this.firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || !userSnap.data()?.['role']) {
          await setDoc(
            userRef,
            {
              uid: user.uid,
              firstName: extraData?.firstName || user.displayName?.split(' ')[0] || '',
              lastName: extraData?.lastName || user.displayName?.split(' ')[1] || '',
              birthDate: extraData?.birthDate || '',
              email: user.email,
              photoURL: user.photoURL || '',
              emailVerified: user.emailVerified,
              role: 'user', // ✅ rôle ajouté si absent
              createdAt: new Date()
            },
            { merge: true }
          );
        }
      }),
      map(cred => cred.user)
    );
  }

  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  resetPassword(email: string): Observable<void> {
    return from(sendPasswordResetEmail(this.auth, email));
  }

  currentUser() {
    return this.auth.currentUser;
  }
}
