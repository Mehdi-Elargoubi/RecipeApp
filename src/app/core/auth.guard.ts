import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}  

  // canActivate(): Observable<boolean> {
  //   return this.authService.authState().pipe(
  //     map(user => {
  //       if (user) {
  //         return true;
  //       }
  //       this.router.navigate(['/login']);
  //       return false;
  //     })
  //   );
  // }

  async canActivate(): Promise<boolean> {
    const user = await this.authService.currentUser();
    if (user && user.emailVerified) {
      return true;
    }

    alert('Veuillez vérifier votre email avant d’accéder à cette page.');
    this.router.navigate(['/login']);
    return false;
  }

}