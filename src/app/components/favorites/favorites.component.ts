import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Meal } from '../../models/meal.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit, OnDestroy {

  favorites: Meal[] = [];
  loading = true;
  error: string | null = null;

  @Input() showTitle: boolean = true;

  private sub?: Subscription;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.sub = this.userService.getFavorites$().subscribe({
      next: (data) => {
        this.favorites = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des favoris';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  goToMeal(id: string) {
    this.router.navigate(['/meal', id]);
  }

  async remove(mealId: string) {
    await this.userService.removeFromFavorites(mealId);
  }
}
