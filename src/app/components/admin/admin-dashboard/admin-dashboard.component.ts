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
  // 🔹 USERS & FAVORITES
  // ======================
  users: any[] = [];
  userMealsMap: { [uid: string]: Meal[] } = {};
  favoritesCountMap: { [uid: string]: number } = {};
  favoriteCategoriesMap: { [uid: string]: string[] } = {};
  favoriteMainCategoryMap: { [uid: string]: string } = {};

  // ======================
  // 🔹 GLOBAL STATS
  // ======================
  totalUsers = 0;
  totalFavorites = 0;
  avgFavorites = 0;

  favoritesByCategory: { [key: string]: number } = {};
  favoritesByUser: { [key: string]: number } = {};
  topCategories: { category: string, count: number }[] = [];

  // ======================
  // 🔹 MODAL EDIT
  // ======================
  showEditModal = false;
  editingMeal: Meal | null = null;
  editName = '';
  editCategory = '';
  editNote = '';

  constructor(private userService: UserService) {}

  async ngOnInit() {
    await this.loadUsers();
  }

  // ======================
  // 🔹 LOAD USERS + STATS
  // ======================
  async loadUsers() {
    this.users = await this.userService.getAllUsers();

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

      this.userMealsMap[user.uid] = favorites;
      this.favoritesCountMap[user.uid] = favorites.length;

      const fullName =
        `${user.firstName || ''} ${user.lastName || ''}`.trim()
        || user.email
        || user.uid;

      this.favoritesByUser[fullName] = favorites.length;
      this.favoriteMainCategoryMap[user.uid] =
        this.getMainFavoriteCategory(favorites);

      this.favoriteCategoriesMap[user.uid] =
        this.getFavoriteCategories(favorites);

      this.totalFavorites += favorites.length;

      favorites.forEach(meal => {
        if (!meal.strCategory) return;
        this.favoritesByCategory[meal.strCategory] =
          (this.favoritesByCategory[meal.strCategory] || 0) + 1;
      });
    });

    this.avgFavorites = this.totalUsers
      ? Math.round(this.totalFavorites / this.totalUsers)
      : 0;

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
    favorites.forEach(m => {
      if (!m.strCategory) return;
      counter[m.strCategory] = (counter[m.strCategory] || 0) + 1;
    });
    return Object.entries(counter)
      .sort((a, b) => b[1] - a[1])
      .map(([c]) => c);
  }

  getMainFavoriteCategory(favorites: Meal[]): string {
    if (!favorites.length) return 'Aucune';
    return this.getFavoriteCategories(favorites)[0];
  }

  getMaxValue(map: { [key: string]: number }): number {
    return Math.max(...Object.values(map), 1);
  }

  // ======================
  // 🔹 ADMIN ACTIONS
  // ======================
  async toggleAdminRole(user: any) {
    await this.userService.setUserRole(
      user.uid,
      user.role === 'admin' ? 'user' : 'admin'
    );
    await this.loadUsers();
  }

  async deleteUser(uid: string) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await this.userService.deleteUser(uid);
    await this.loadUsers();
  }

  async deleteMeal(userUid: string, mealId: string) {
    if (!confirm('Supprimer ce meal des favoris de cet utilisateur ?')) return;
    const favorites =
      this.userMealsMap[userUid].filter(m => m.idMeal !== mealId);
    await this.userService.updateProfileForUser(userUid, { favorites });
    await this.loadUsers();
  }

  // ======================
  // 🔥 MODAL EDIT MEAL
  // ======================
  openEditMealModal(meal: Meal) {
    this.editingMeal = meal;
    this.editName = meal.strMeal;
    this.editCategory = meal.strCategory;
    this.editNote = (meal as any).note || '';
    this.showEditModal = true;
  }

  closeEditMealModal() {
    this.showEditModal = false;
    this.editingMeal = null;
  }

  async saveMealEdit() {
    if (!this.editingMeal) return;

    const updatedMeal: Meal = {
      ...this.editingMeal,
      strMeal: this.editName.trim(),
      strCategory: this.editCategory.trim(),
      ...(this.editNote && { note: this.editNote })
    };

    await this.userService.updateMealForAllUsers(updatedMeal);
    this.closeEditMealModal();
    await this.loadUsers();
  }
}
