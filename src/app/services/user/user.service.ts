import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, deleteDoc, doc, docData, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Observable, firstValueFrom } from 'rxjs';
import { Meal } from '../../models/meal.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  private currentUser: User | null = null;

  constructor(private firestore: Firestore, private auth: Auth) {
    onAuthStateChanged(this.auth, user => {
      this.currentUser = user;
    });
  }

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
    const ref = doc(this.firestore, 'users', this.currentUser.uid);
    return docData(ref);
  }

  updateProfile(data: any) {
    if (!this.currentUser) return;
    const ref = doc(this.firestore, 'users', this.currentUser.uid);
    return updateDoc(ref, data);
  }

  async getFavorites(): Promise<Meal[]> {
    const user = await this.getUser();
    if (!user) return [];
    const snap = await getDoc(doc(this.firestore, 'users', user.uid));
    return snap.exists() ? snap.data()?.['favorites'] || [] : [];
  }

  async addToFavorites(meal: Meal): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    const ref = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(ref);
    let favorites: Meal[] = snap.exists() ? snap.data()?.['favorites'] || [] : [];

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

    const favorites = (snap.data()?.['favorites'] || []).filter((m: Meal) => m.idMeal !== mealId);
    await updateDoc(ref, { favorites });
  }

  async isFavorite(mealId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(m => m.idMeal === mealId);
  }

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

  async isAdmin(): Promise<boolean> {
    const user = await this.getUser();
    if (!user) return false;

    const snap = await getDoc(doc(this.firestore, 'users', user.uid));
    console.log('USER DATA:', snap.data());
    return snap.exists() && snap.data()?.['role'] === 'admin';
  }

  async getAllUsers(): Promise<any[]> {
    const usersCol = collection(this.firestore, 'users');
    const usersSnap$ = collectionData(usersCol, { idField: 'uid' });
    const usersSnap = await firstValueFrom(usersSnap$);
    return usersSnap || [];
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



  async updateFavoriteMeal(userId: string, updatedMeal: any): Promise<void> {
    const ref = doc(this.firestore, 'users', userId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return;

    const favorites = snap.data()?.['favorites'] || [];

    const updatedFavorites = favorites.map((m: any) =>
      m.idMeal === updatedMeal.idMeal ? updatedMeal : m
    );

    await updateDoc(ref, { favorites: updatedFavorites });
  }



  

  

}
