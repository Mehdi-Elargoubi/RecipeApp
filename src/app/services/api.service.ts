import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Meal, Ingredient } from '../models/meal.model';

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
