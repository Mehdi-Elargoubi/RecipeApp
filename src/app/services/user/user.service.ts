import { Injectable } from '@angular/core';
import { Firestore, doc, docData, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';
import { Meal } from '../../models/meal.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private currentUser: User | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
    });
  }

  // 🔐 Attendre l'utilisateur Firebase (IMPORTANT)
  private async getUser(): Promise<User | null> {
    if (this.currentUser) return this.currentUser;

    return new Promise(resolve => {
      const unsub = onAuthStateChanged(this.auth, user => {
        resolve(user);
        unsub();
      });
    });
  }

  // 👤 Profil utilisateur
  getUserProfile(): Observable<any> {
    if (!this.currentUser) throw new Error('Utilisateur non connecté');
    const ref = doc(this.firestore, 'users', this.currentUser.uid);
    return docData(ref);
  }

  updateProfile(data: any) {
    if (!this.currentUser) return;
    const ref = doc(this.firestore, 'users', this.currentUser.uid);
    return updateDoc(ref, data);
  }

  // ⭐ FAVORIS
  async getFavorites(): Promise<Meal[]> {
    const user = await this.getUser();
    if (!user) return [];

    const snap = await getDoc(doc(this.firestore, 'users', user.uid));
    return snap.exists() ? snap.data()['favorites'] || [] : [];
  }

  async addToFavorites(meal: Meal): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);

    let favorites: Meal[] = snap.exists() ? snap.data()['favorites'] || [] : [];

    if (!favorites.find(f => f.idMeal === meal.idMeal)) {
      favorites.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strArea: meal.strArea,
        strInstructions: '',
        strTags: null,
        strYoutube: null,
        ingredients: []
      });
      await updateDoc(ref, { favorites });
    }
  }

  async removeFromFavorites(mealId: string): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const favorites = (snap.data()['favorites'] || [])
      .filter((m: Meal) => m.idMeal !== mealId);

    await updateDoc(ref, { favorites });
  }

  async isFavorite(mealId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(m => m.idMeal === mealId);
  }

  // 🕒 HISTORIQUE DES MEALS VISITÉS
  async addVisitedMeal(meal: Meal): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);

    let visited = snap.exists() ? snap.data()['visitedMeals'] || [] : [];

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
    return snap.exists() ? snap.data()['visitedMeals'] || [] : [];
  }
}
