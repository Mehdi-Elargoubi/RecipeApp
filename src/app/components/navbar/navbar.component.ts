import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

    user$: Observable<User | null>; // Observable de l'utilisateur connecté
    
  constructor(private authService: AuthService, private router: Router) {
    this.user$ = this.authService.authState(); // Récupère l'état d'authentification
  }


    logout() {
    this.authService.logout().subscribe({
      next: () => {
        alert('Vous êtes maintenant déconnecté.');
        this.router.navigate(['/login']); // redirige vers login
      },
      error: (error) => {
        console.error('Erreur lors de la déconnexion :', error);
        alert('Erreur lors de la déconnexion : ' + error.message);
      }
    });
  }

}
