import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user/user.service';
import { Meal } from '../../models/meal.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  favorites: Meal[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  // 🔹 Charger les favoris
  async loadFavorites() {
    try {
      this.loading = true;
      this.favorites = await this.userService.getFavorites();
    } catch (err) {
      console.error(err);
      this.error = 'Erreur lors du chargement des favoris';
    } finally {
      this.loading = false;
    }
  }

  // 🔹 Aller à la page meal-details
  goToMeal(id: string) {
    this.router.navigate(['/meal', id]);
  }

  // ❌ Supprimer un favori
  async remove(mealId: string) {
    await this.userService.removeFromFavorites(mealId);
    this.loadFavorites();
  }
}
