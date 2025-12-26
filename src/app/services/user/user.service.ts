import { Injectable } from '@angular/core';
import { Firestore, doc, docData, getDoc, updateDoc } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom, map, Observable, of } from 'rxjs';
import { Meal } from '../../models/meal.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private firestore: Firestore, private auth: Auth) {}

  getUserProfile(): Observable<any> {
    const uid = this.auth.currentUser?.uid;
    if (!uid) throw new Error('Utilisateur non connecté');

    const ref = doc(this.firestore, 'users', uid);
    return docData(ref);
  }

  updateProfile(data: any) {
    const uid = this.auth.currentUser?.uid;
    if (!uid) return;

    const ref = doc(this.firestore, 'users', uid);
    return updateDoc(ref, data);
  }



  // 🔹 Récupérer les favoris
  async getFavorites0(): Promise<Meal[]> {
    const user = this.auth.currentUser;
    if (!user) return [];

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      return snap.data()['favorites'] || [];
    }
    return [];
  }
  
    // 🔹 Récupérer les favoris
  async getFavorites(): Promise<Meal[]> {
    // attendre que l'utilisateur soit défini
    const user = await firstValueFrom(authState(this.auth));
    if (!user) return [];

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data();
      // Retourner le tableau favorites correctement typé
      return (data?.['favorites'] || []).map((m: any) => ({
        idMeal: m.idMeal,
        strMeal: m.strMeal,
        strMealThumb: m.strMealThumb,
        strCategory: m.strCategory,
        strArea: m.strArea
      }));
    }
    return [];
  }
  


    // ⭐ Ajouter un favori
  async addToFavorites(meal: Meal): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    let favorites: Meal[] = snap.exists()
      ? snap.data()['favorites'] || []
      : [];

    // éviter les doublons
    if (!favorites.find(f => f.idMeal === meal.idMeal)) {
      favorites.push({
        idMeal: meal.idMeal,
        strMeal: meal.strMeal,
        strMealThumb: meal.strMealThumb,
        strCategory: meal.strCategory,
        strArea: meal.strArea
      } as Meal);

      await updateDoc(userRef, { favorites });
    }
  }


  // ❌ Supprimer un favori
  async removeFromFavorites(mealId: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user) return;

    const userRef = doc(this.firestore, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) return;

    const favorites: Meal[] = (snap.data()['favorites'] || [])
      .filter((m: Meal) => m.idMeal !== mealId);

    await updateDoc(userRef, { favorites });
  }

  // 🔁 Vérifier si un meal est favori
  async isFavorite(mealId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.some(m => m.idMeal === mealId);
  }

}
