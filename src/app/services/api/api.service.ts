import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map } from 'rxjs';
import { Meal, Ingredient } from '../../models/meal.model';
import { Category } from '../../models/category.model';
import { Area } from '../../models/area.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://www.themealdb.com/api/json/v1/1';

  constructor(private http: HttpClient) {}

  // Chercher par nom
  searchMealByName(name: string): Observable<Meal[]> {
    return this.http.get<any>(`${this.baseUrl}/search.php?s=${name}`).pipe(
      map(res => res.meals?.map(this.mapMeal) || [])
    );
  }

  // Chercher par première lettre
  searchMealByFirstLetter(letter: string): Observable<Meal[]> {
    return this.http.get<any>(`${this.baseUrl}/search.php?f=${letter}`).pipe(
      map(res => res.meals?.map(this.mapMeal) || [])
    );
  }

  // Liste aléatoire
  getRandomMeal(): Observable<Meal> {
    return this.http.get<any>(`${this.baseUrl}/random.php`).pipe(
      map(res => this.mapMeal(res.meals[0]))
    );
  }

  // Détails complets par ID
  getMealById(id: string): Observable<Meal> {
    return this.http.get<any>(`${this.baseUrl}/lookup.php?i=${id}`).pipe(
      map(res => this.mapMeal(res.meals[0]))
    );
  }

    // 🆕 ⭐ Obtenir TOUTES les meals (A → Z)
  getAllMeals(): Observable<Meal[]> {
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

    const requests = letters.map(letter =>
      this.http.get<any>(`${this.baseUrl}/search.php?f=${letter}`)
    );

    return forkJoin(requests).pipe(
      map((responses: any[]) => {
        const allMeals: Meal[] = [];

        responses.forEach(res => {
          if (res.meals) {
            res.meals.forEach((raw: any) => {
              allMeals.push(this.mapMeal(raw));
            });
          }
        });

        return allMeals;
      })
    );
  }

  // 🔥 Nouveau : Lister toutes les catégories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<any>(`${this.baseUrl}/categories.php`).pipe(
      map(res => res.categories || [])
    );
  }

  // Lister toutes les zones (Area : Italian, Moroccan, American…)
  getAllAreas(): Observable<Area[]> {
    return this.http.get<any>(`${this.baseUrl}/list.php?a=list`).pipe(
      map(res => res.meals || [])
    );
  }

  // Récupérer tous les meals d'une area
  getMealsByArea(area: string): Observable<Meal[]> {
    return this.http.get<any>(`${this.baseUrl}/filter.php?a=${area}`).pipe(
      map(res =>
        res.meals?.map((m: any) => ({
          idMeal: m.idMeal,
          strMeal: m.strMeal,
          strMealThumb: m.strMealThumb,
          // les détails ne sont pas inclus dans filter.php
          strCategory: '',
          strArea: area,
          strInstructions: '',
          strTags: '',
          strYoutube: '',
          ingredients: []
        })) || []
      )
    );
  }


  ////////////////////////////////////////7
  filterByCategory(category: string): Observable<Meal[]> {
    return this.http.get<any>(`${this.baseUrl}/filter.php?c=${category}`).pipe(
      map(res => res.meals?.map((m: any) => ({ 
        idMeal: m.idMeal, 
        strMeal: m.strMeal, 
        strMealThumb: m.strMealThumb,
        strCategory: category
      })) || [])
    );
  }

  // Liste des ingrédients
  getAllIngredients(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/list.php?i=list`).pipe(
      map(res => res.meals || [])
    );
  }

  // Meals par ingrédient
  getMealsByIngredient(ingredient: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/filter.php?i=${ingredient}`).pipe(
      map(res => res.meals || [])
    );
  }

  
  // Mapper la réponse API en format Meal avec ingrédients + mesures
  private mapMeal(raw: any): Meal {
    const ingredients: Ingredient[] = [];
    for (let i = 1; i <= 20; i++) {
      const name = raw[`strIngredient${i}`]?.trim();
      const measure = raw[`strMeasure${i}`]?.trim();
      if (name && name !== '') {
        ingredients.push({ name, measure: measure || '' });
      }
    }

    return {
      idMeal: raw.idMeal,
      strMeal: raw.strMeal,
      strCategory: raw.strCategory,
      strArea: raw.strArea,
      strInstructions: raw.strInstructions,
      strMealThumb: raw.strMealThumb,
      strTags: raw.strTags,
      strYoutube: raw.strYoutube,
      ingredients
    };
  }


  
}
