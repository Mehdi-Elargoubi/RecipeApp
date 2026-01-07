import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Meal } from '../../models/meal.model';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.component.html',
  styleUrls: ['./meal-details.component.css']
})
export class MealDetailsComponent implements OnInit {

  meal!: Meal;
  loading = true;
  error: string | null = null;

  // ⭐ Favoris
  isFavorite = false;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private userService: UserService
  ) {}

  async ngOnInit(): Promise<void> {
    const mealId = this.route.snapshot.paramMap.get('id');
    if (!mealId) return;

    await this.loadMeal(mealId);
  }

  // 🔥 LOGIQUE PRINCIPALE
  private async loadMeal(mealId: string): Promise<void> {
    this.loading = true;

    try {
      // 1️⃣ Essayer Firestore (favoris)
      const favoriteMeal = await this.userService.getFavoriteMealById(mealId);

      if (favoriteMeal) {
        this.meal = favoriteMeal;
        this.isFavorite = true;

        // ⭐ Enregistrer comme meal visité
        await this.userService.addVisitedMeal(this.meal);

        this.loading = false;
        return;
      }

      // 2️⃣ Sinon → API
      this.api.getMealById(mealId).subscribe({
        next: async (data) => {
          this.meal = data;

          this.isFavorite = await this.userService.isFavorite(mealId);

          // ⭐ Enregistrer comme meal visité
          await this.userService.addVisitedMeal(this.meal);

          this.loading = false;
        },
        error: () => {
          this.error = 'Impossible de charger le meal';
          this.loading = false;
        }
      });

    } catch (err) {
      console.error(err);
      this.error = 'Erreur lors du chargement du meal';
      this.loading = false;
    }
  }

  // ⭐ Ajouter / retirer des favoris
  async toggleFavorite0(): Promise<void> {
    if (!this.meal) return;

    try {
      if (this.isFavorite) {
        await this.userService.removeFromFavorites(this.meal.idMeal);
      } else {
        await this.userService.addToFavorites(this.meal); // 🔥 meal COMPLET
      }
      this.isFavorite = !this.isFavorite;
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la gestion des favoris.');
    }
  }

  // ✅ Génération robuste des instructions (INCHANGÉ)
  get instructionsList(): string[] {
    if (!this.meal?.strInstructions) return [];

    const instructions = this.meal.strInstructions.trim();

    const stepRegex =
      /(STEP\s*\d+|Step\s*\d+)\s*[:\-]?\s*(.*?)(?=(STEP\s*\d+|Step\s*\d+)|$)/gis;

    const matches = [...instructions.matchAll(stepRegex)];

    if (matches.length > 0) {
      return matches
        .map(match => {
          const stepLabel = match[1].trim();
          const desc = match[2]?.trim();

          if (!desc || desc === '▢' || !/[a-zA-Z]/.test(desc)) {
            return null;
          }

          return `${stepLabel}: ${desc}`;
        })
        .filter(Boolean) as string[];
    }

    const linesOrSentences = instructions
      .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== '▢' && /[a-zA-Z]/.test(s));

    return linesOrSentences.map((s, i) => {
      const isAlreadyNumbered = /^(\d+[\.\)]|Step\s*\d+)/i.test(s);
      return isAlreadyNumbered ? s : `Step ${i + 1}: ${s}`;
    });
  }

  async toggleFavorite(): Promise<void> {
  if (!this.meal) return;

  try {
    if (this.isFavorite) {
      await this.userService.removeFromFavorites(this.meal.idMeal);
    } else {
      await this.userService.addToFavorites(this.meal); // 🔥 meal COMPLET
    }
    this.isFavorite = !this.isFavorite;
  } catch (err) {
    console.error(err);
    alert('Erreur lors de la gestion des favoris.');
  }
}

// 🔹 Si tu modifies le meal (via Admin par exemple), appeler :
async saveMealChanges(updatedMeal: Meal) {
  // Mettre à jour globalement
  await this.userService.updateFavoriteMealGlobally(updatedMeal);

  // Si l'utilisateur actuel a ce meal, mettre à jour localement aussi
  if (this.isFavorite) {
    this.meal = updatedMeal;
  }
}

}
