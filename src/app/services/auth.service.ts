import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
         signOut, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail, 
         authState} from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore';
import { setDoc } from 'firebase/firestore';
import { doc } from 'firebase/firestore';

import { sendEmailVerification } from '@angular/fire/auth';

export interface UserData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  password: string;
  photoURL?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) {}

  // État de l’utilisateur
  getUser(): Observable<any> {
    return authState(this.auth); // retourne l’état de l’utilisateur connecté
  }

  // Observable de l'état d'auth (null ou User)
  authState(): Observable<User | null> {
    return new Observable(sub => {
      return this.auth.onAuthStateChanged(user => sub.next(user));
    });
  }

  // Inscription
  // register(email: string, password: string) {
  //   return from(createUserWithEmailAndPassword(this.auth, email, password));
  // }

  // register(userData:UserData): Observable<void> {
  //   const { firstName, lastName, birthDate, email, password, photoURL } = userData;

  //   return from(
  //     createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
  //       // Mettre à jour le profil de l'utilisateur avec les informations supplémentaires
  //       const user = userCredential.user;
  //       // Mettre à jour le profil avec le nom complet et la photo
  //       await updateProfile(user, {
  //         //displayName: `${firstName} ${lastName}`,
  //         displayName: firstName  && lastName ? `${firstName} ${lastName}` : undefined,
  //         photoURL: photoURL || ''
  //       });

  //       // Enregistrer les informations supplémentaires dans Firestore
  //       await setDoc(doc(this.firestore, 'users', user.uid), {
  //         uid: user.uid,
  //         firstName,
  //         lastName,
  //         birthDate,
  //         email,
  //         photoURL: photoURL || '',
  //         createdAt: new Date()
  //       });
  //     })
  //   );
  // }


 // 🔹 Inscription avec email de vérification
  // register(userData: UserData): Observable<void> {
  //   const { firstName, lastName, birthDate, email, password, photoURL } = userData;

  //   return from(
  //     createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
  //       const user = userCredential.user;

  //       await updateProfile(user, {
  //         displayName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
  //         photoURL: photoURL || ''
  //       });

  //       // 🔸 Envoi de l'email de vérification
  //       await sendEmailVerification(user);

  //       // 🔸 Enregistrer dans Firestore
  //       await setDoc(doc(this.firestore, 'users', user.uid), {
  //         uid: user.uid,
  //         firstName,
  //         lastName,
  //         birthDate,
  //         email,
  //         photoURL: photoURL || '',
  //         emailVerified: user.emailVerified,
  //         createdAt: new Date()
  //       });
  //     })
  //   );
  // }

register(userData: UserData): Observable<void> {
  const { firstName, lastName, birthDate, email, password, photoURL } = userData;

  return from(
    createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
      const user = userCredential.user;

      // Mettre à jour le profil utilisateur
      await updateProfile(user, {
        displayName: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        photoURL: photoURL || ''
      });

      try {
        // Envoyer l'email de vérification
        await sendEmailVerification(user);
        console.log('Email de vérification envoyé.');
      } catch (error) {
        console.error('Erreur lors de l’envoi de l’email de vérification :', error);
        throw new Error('Impossible d’envoyer l’email de vérification. Veuillez réessayer plus tard.');
      }

      // Déconnexion immédiate après l'inscription
      await signOut(this.auth);
    })
  );
}


  // Connexion Email / Password
  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  // Connexion Google (popup)
  loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  // Déconnexion
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }

  // Reset password
  resetPassword(email: string): Observable<void> {
  return from(sendPasswordResetEmail(this.auth, email));
  }

  // Récupérer utilisateur courant (promise)
  currentUser() {
    return this.auth.currentUser;
  }
}
