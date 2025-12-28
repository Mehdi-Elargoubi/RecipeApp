import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from '../services/user/user.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private userService: UserService, private router: Router) {}

  async canActivate(): Promise<boolean> {
    const isAdmin = await this.userService.isAdmin();
    if (!isAdmin) {
      alert('Accès réservé aux administrateurs');
      this.router.navigate(['/']);
      return false;
    }
    return true;
  }
}
