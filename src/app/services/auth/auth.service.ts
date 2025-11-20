import { Injectable } from '@angular/core';
import {
  Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  signOut, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail,
  authState
} from '@angular/fire/auth';
import { from, Observable, tap } from 'rxjs';
import { User as FirebaseUser, UserCredential } from 'firebase/auth';
import { Firestore } from '@angular/fire/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { doc } from 'firebase/firestore';

import { sendEmailVerification } from '@angular/fire/auth';
import { browserLocalPersistence, setPersistence } from '@angular/fire/auth';

export interface UserData {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  email: string;
  password: string;
  photoURL?: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  constructor(private auth: Auth, private firestore: Firestore) { }

  // État de l’utilisateur
  getUser(): Observable<any> {
    return authState(this.auth); // retourne l’état de l’utilisateur connecté
  }

  // Observable de l'état d'auth (null ou User)
  authState(): Observable<FirebaseUser | null> {
    return new Observable(sub => {
      return this.auth.onAuthStateChanged(user => sub.next(user));
    });
  }

  register(userData: UserData): Observable<void> {
    const { firstName, lastName, birthDate, email, password, photoURL } = userData;

    return from(
      createUserWithEmailAndPassword(this.auth, email, password).then(async (userCredential) => {
        const user = userCredential.user;
        console.log('Registered user:', user);

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
  login(email: string, password: string, extraData?: { birthDate?: string, firstName?: string, lastName?: string }): Observable<UserCredential> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      tap(async (cred) => {
        const user = cred.user;

        if (!user.emailVerified) {
          console.warn('Email not verified. User cannot be stored in Firestore yet.');
          throw new Error('Veuillez vérifier votre email avant de vous connecter.');
        }

        // Check if user is already stored in Firestore
        const userRef = doc(this.firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Store the user for the first time
          await setDoc(userRef, {
            uid: user.uid,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ')[1] || '',
            birthDate: extraData?.birthDate || '',
            email: user.email,
            photoURL: user.photoURL || '',
          });
          console.log('User stored in Firestore after first login.');
        } else {
          console.log('User already exists in Firestore. No action needed.');
        }
      })
    );
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

  async checkUserExists(uid: string): Promise<boolean> {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  }

  async getUserByUid(uid: string): Promise<any | null> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data();
      } else {
        console.log('No user found with UID:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving user from Firestore:', error);
      return null;
    }
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


}
