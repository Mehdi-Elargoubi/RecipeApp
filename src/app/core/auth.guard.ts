import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { User } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  //constructor(private authService: AuthService, private router: Router) {}  
  constructor(private authService: AuthService, private auth: Auth, private router: Router) {}
  
  async canActivate(): Promise<boolean> {
    // Attendre que Firebase récupère l'état de l'utilisateur
    const user = await new Promise<User | null>((resolve) => {
      const unsubscribe = this.auth.onAuthStateChanged((firebaseUser: User | null) => {
        unsubscribe(); // Désabonner après avoir récupéré l'utilisateur
        resolve(firebaseUser);
      });
    });

    if (user && user.emailVerified) {
      return true;
    }
    

    alert('Veuillez vérifier votre email avant d’accéder à cette page.');
    this.router.navigate(['/login']);
    return false;
  }

}