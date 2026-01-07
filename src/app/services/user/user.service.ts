import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  deleteDoc,
  doc,
  docData,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, firstValueFrom, map, of } from 'rxjs';
import { Meal } from '../../models/meal.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private currentUser: User | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
    });
  }

  // =====================================================
  // 🔹 AUTH / USER
  // =====================================================
  private async getUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;

    return new Promise(resolve => {
      const unsub = onAuthStateChanged(this.auth, user => {
        resolve(user);
        unsub();
      });
    });
  }

  getUserProfile(): Observable<any> {
    if (!this.currentUser) throw new Error('Utilisateur non connecté');
    return docData(doc(this.firestore, 'users', this.currentUser.uid));
  }

  updateProfile(data: any) {
    if (!this.currentUser) return;
    return updateDoc(doc(this.firestore, 'users', this.currentUser.uid), data);
  }

  // =====================================================
  // 🔹 FAVORITES (FIRESTORE ONLY)
  // =====================================================
  async getFavorites(): Promise<Meal[]> {
    const user = await this.getUser();
    if (!user) return [];

    const snap = await getDoc(doc(this.firestore, 'users', user.uid));
    let favorites: Meal[] = snap.exists() ? snap.data()?.['favorites'] || [] : [];

    return this.migrateFavorites(favorites);
  }

  getFavorites$(): Observable<Meal[]> {
    if (!this.currentUser) return of([]);

    return docData(doc(this.firestore, 'users', this.currentUser.uid)).pipe(
      map((data: any) => this.migrateFavorites(data?.favorites || []))
    );
  }

  async addToFavorites(meal: Meal): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);
    const favorites: Meal[] = snap.exists() ? snap.data()?.['favorites'] || [] : [];

    if (!favorites.find(f => f.idMeal === meal.idMeal)) {
      favorites.push(meal); // 🔥 MEAL COMPLET
      await updateDoc(ref, { favorites });
    }
  }

  async removeFromFavorites(mealId: string): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const favorites = (snap.data()?.['favorites'] || [])
      .filter((m: Meal) => m.idMeal !== mealId);

    await updateDoc(ref, { favorites });
  }

  async isFavorite(mealId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(m => m.idMeal === mealId);
  }

  async getFavoriteMealById(mealId: string): Promise<Meal | null> {
    const favorites = await this.getFavorites();
    return favorites.find(m => m.idMeal === mealId) || null;
  }

  // =====================================================
  // 🔹 GLOBAL FAVORITE UPDATE (ADMIN)
  // =====================================================
  async updateFavoriteMealGlobally(updatedMeal: Meal): Promise<void> {
    const users = await this.getAllUsers();

    for (const user of users) {
      const favorites: Meal[] = user.favorites || [];
      const updatedFavorites = favorites.map(f =>
        f.idMeal === updatedMeal.idMeal ? updatedMeal : f
      );

      await updateDoc(doc(this.firestore, 'users', user.uid), {
        favorites: updatedFavorites
      });
    }
  }

  // =====================================================
  // 🔹 MIGRATION AUTO DES ANCIENS FAVORIS
  // =====================================================
  private migrateFavorites(favorites: Meal[]): Meal[] {
    return favorites.map(f => ({
      idMeal: f.idMeal,
      strMeal: f.strMeal || '',
      strMealThumb: f.strMealThumb || '',
      strCategory: f.strCategory || '',
      strArea: f.strArea || '',
      strInstructions: f.strInstructions || '',
      strTags: f.strTags || null,
      strYoutube: f.strYoutube || null,
      ingredients: f.ingredients || []
    }));
  }

  // =====================================================
  // 🔹 VISITED MEALS
  // =====================================================
  async addVisitedMeal(meal: Meal): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);
    let visited = snap.exists() ? snap.data()?.['visitedMeals'] || [] : [];

    visited = visited.filter((m: any) => m.idMeal !== meal.idMeal);

    visited.unshift({
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
      visitedAt: new Date()
    });

    if (visited.length > 20) visited = visited.slice(0, 20);
    await updateDoc(ref, { visitedMeals: visited });
  }

  async getVisitedMeals(): Promise<Meal[]> {
    const user = await this.getUser();
    if (!user) return [];
    const snap = await getDoc(doc(this.firestore, 'users', user.uid));
    return snap.exists() ? snap.data()?.['visitedMeals'] || [] : [];
  }

  // =====================================================
  // 🔹 ADMIN
  // =====================================================
  async isAdmin(): Promise<boolean> {
    const user = await this.getUser();
    if (!user) return false;

    const snap = await getDoc(doc(this.firestore, 'users', user.uid));
    return snap.exists() && snap.data()?.['role'] === 'admin';
  }

  async getAllUsers(): Promise<any[]> {
    const usersCol = collection(this.firestore, 'users');
    return await firstValueFrom(collectionData(usersCol, { idField: 'uid' }));
  }

  async setUserRole(uid: string, role: 'user' | 'admin') {
    await updateDoc(doc(this.firestore, 'users', uid), { role });
  }

  async deleteUser(uid: string) {
    await deleteDoc(doc(this.firestore, 'users', uid));
  }

  async updateProfileForUser(uid: string, data: any) {
    await updateDoc(doc(this.firestore, 'users', uid), data);
  }

  async updateFavoriteMeal(userId: string, updatedMeal: Meal): Promise<void> {
    const ref = doc(this.firestore, 'users', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;

    const favorites = snap.data()?.['favorites'] || [];
    const updatedFavorites = favorites.map((m: Meal) =>
      m.idMeal === updatedMeal.idMeal ? updatedMeal : m
    );

    await updateDoc(ref, { favorites: updatedFavorites });
  }

async updateMealForAllUsers(updatedMeal: Meal): Promise<void> {
  const usersCol = collection(this.firestore, 'users');
  const usersSnap$ = collectionData(usersCol, { idField: 'uid' });
  const users = await firstValueFrom(usersSnap$);

  for (const user of users) {
    const favorites: Meal[] = user['favorites'] || [];

    const hasMeal = favorites.some(m => m.idMeal === updatedMeal.idMeal);
    if (!hasMeal) continue;

    const updatedFavorites = favorites.map(m =>
      m.idMeal === updatedMeal.idMeal ? { ...m, ...updatedMeal } : m
    );

    await updateDoc(doc(this.firestore, 'users', user.uid), {
      favorites: updatedFavorites
    });
  }
}








}
