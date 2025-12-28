import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user/user.service';
import { Meal } from '../../../models/meal.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  users: any[] = [];
  userMealsMap: { [uid: string]: Meal[] } = {};

  favoritesCountMap: { [uid: string]: number } = {};
  favoriteCategoriesMap: { [uid: string]: string[] } = {};

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  // 🔹 Charger users + favorites + stats
  async loadUsers() {
    this.users = await this.userService.getAllUsers();

    this.userMealsMap = {};
    this.favoritesCountMap = {};
    this.favoriteCategoriesMap = {};

    this.users.forEach(user => {
      const favorites = user.favorites || [];

      this.userMealsMap[user.uid] = favorites;
      this.favoritesCountMap[user.uid] = favorites.length;
      this.favoriteCategoriesMap[user.uid] =
        this.getFavoriteCategories(favorites);
    });
  }

  // 🔹 Catégories préférées
  getFavoriteCategories(favorites: Meal[]): string[] {
    const counter: { [key: string]: number } = {};

    favorites.forEach(meal => {
      if (!meal.strCategory) return;
      counter[meal.strCategory] = (counter[meal.strCategory] || 0) + 1;
    });

    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .map(e => e[0]);
  }

  // 🔹 Toggle admin
  async toggleAdminRole(user: any) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await this.userService.setUserRole(user.uid, newRole);
    await this.loadUsers();
  }

  // 🔹 Supprimer user
  async deleteUser(uid: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await this.userService.deleteUser(uid);
    await this.loadUsers();
  }

  // 🔹 Supprimer un favori d’un user
  async deleteMeal(userUid: string, mealId: string) {
    if (!confirm('Supprimer ce meal des favoris ?')) return;

    const favorites =
      this.userMealsMap[userUid].filter(m => m.idMeal !== mealId);

    await this.userService.updateProfileForUser(userUid, { favorites });
    await this.loadUsers();
  }

  // 🆕 🔹 MODIFIER un meal favori
  async editMeal(userUid: string, meal: Meal) {
    const newName = prompt('Nom du meal', meal.strMeal);
    if (newName === null) return;

    const newCategory = prompt('Catégorie', meal.strCategory);
    if (newCategory === null) return;

    const note = prompt('Note admin (optionnelle)', (meal as any).note || '');

    await this.userService.updateFavoriteMeal(userUid, {
      ...meal,
      strMeal: newName,
      strCategory: newCategory,
      note
    });

    await this.loadUsers(); // refresh UI
  }
}
