import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../services/user/user.service';
import { Meal } from '../../../models/meal.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  // ======================
  // 🔹 DATA USERS & MEALS
  // ======================
  users: any[] = [];

  userMealsMap: { [uid: string]: Meal[] } = {};
  favoritesCountMap: { [uid: string]: number } = {};
  favoriteCategoriesMap: { [uid: string]: string[] } = {};
  favoriteMainCategoryMap: { [uid: string]: string } = {}; // top catégorie par user

  // ======================
  // 🔹 STATS GLOBALES
  // ======================
  totalUsers = 0;
  totalFavorites = 0;
  avgFavorites = 0;

  // ======================
  // 🔹 STATS POUR DASHBOARD
  // ======================
  favoritesByCategory: { [key: string]: number } = {};
  favoritesByUser: { [key: string]: number } = {};
  topCategories: { category: string, count: number }[] = [];

  constructor(private userService: UserService) {}

  // ======================
  // 🔹 INIT
  // ======================
  async ngOnInit() {
    await this.loadUsers();
  }

  // ======================
  // 🔹 LOAD USERS + STATS
  // ======================
  async loadUsers() {
    this.users = await this.userService.getAllUsers();

    // Reset
    this.userMealsMap = {};
    this.favoritesCountMap = {};
    this.favoriteCategoriesMap = {};
    this.favoriteMainCategoryMap = {};
    this.favoritesByCategory = {};
    this.favoritesByUser = {};
    this.totalFavorites = 0;

    this.totalUsers = this.users.length;

    this.users.forEach(user => {
      const favorites: Meal[] = user.favorites || [];

      // 🔹 Mapping
      this.userMealsMap[user.uid] = favorites;
      this.favoritesCountMap[user.uid] = favorites.length;
      // this.favoritesByUser[user.email || user.uid] = favorites.length;
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.uid;
      this.favoritesByUser[fullName] = favorites.length;


      // 🔹 Top catégorie par user
      this.favoriteMainCategoryMap[user.uid] =
        this.getMainFavoriteCategory(favorites);

      // 🔹 Total favoris
      this.totalFavorites += favorites.length;

      // 🔹 Catégories globales
      this.favoriteCategoriesMap[user.uid] = this.getFavoriteCategories(favorites);

      favorites.forEach(meal => {
        if (!meal.strCategory) return;
        this.favoritesByCategory[meal.strCategory] =
          (this.favoritesByCategory[meal.strCategory] || 0) + 1;
      });
    });

    // 🔹 Moyenne favoris / user
    this.avgFavorites = this.totalUsers > 0
      ? Math.round(this.totalFavorites / this.totalUsers)
      : 0;

    // 🔹 Top 3 catégories globales
    this.topCategories = Object.entries(this.favoritesByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }

  // ======================
  // 🔹 UTILS
  // ======================
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

  getMainFavoriteCategory(favorites: Meal[]): string {
    if (!favorites.length) return 'Aucune';
    const counter: { [key: string]: number } = {};
    favorites.forEach(meal => {
      if (!meal.strCategory) return;
      counter[meal.strCategory] = (counter[meal.strCategory] || 0) + 1;
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])[0][0];
  }

  getMaxValue(map: { [key: string]: number }): number {
    return Math.max(...Object.values(map), 1);
  }

  // ======================
  // 🔹 ACTIONS ADMIN
  // ======================
  async toggleAdminRole(user: any) {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    await this.userService.setUserRole(user.uid, newRole);
    await this.loadUsers();
  }

  async deleteUser(uid: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await this.userService.deleteUser(uid);
    await this.loadUsers();
  }

  // ======================
  // 🔹 GESTION FAVORIS USER
  // ======================
  async deleteMeal(userUid: string, mealId: string) {
    if (!confirm('Supprimer ce meal des favoris ?')) return;
    const favorites = this.userMealsMap[userUid].filter(m => m.idMeal !== mealId);
    await this.userService.updateProfileForUser(userUid, { favorites });
    await this.loadUsers();
  }

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

    await this.loadUsers();
  }
}
