import { Component } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service'; ;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'

})
export class DashboardComponent {
  userEmail: string | null = null;

    constructor(private authService: AuthService) {
    // récupérer l’utilisateur connecté
    this.authService.authState().subscribe(user => {
      this.userEmail = user ? user.email : null;
    });
  }

}
