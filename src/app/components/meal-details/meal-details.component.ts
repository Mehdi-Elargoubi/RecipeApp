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

  ngOnInit(): void {
    const mealId = this.route.snapshot.paramMap.get('id');

    if (!mealId) {
      this.error = 'ID du repas invalide.';
      this.loading = false;
      return;
    }

    this.loadMeal(mealId);
  }

  private loadMeal(mealId: string): void {
    this.loading = true;

    this.api.getMealById(mealId).subscribe({
      next: async (data) => {
        this.meal = data;

        // 🔹 Vérifier si le meal est déjà en favori
        this.isFavorite = await this.userService.isFavorite(this.meal.idMeal);

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Impossible de charger les détails du repas.';
        this.loading = false;
      }
    });
  }

  // ⭐ Ajouter / retirer des favoris
  async toggleFavorite(): Promise<void> {
    if (!this.meal) return;

    try {
      if (this.isFavorite) {
        await this.userService.removeFromFavorites(this.meal.idMeal);
      } else {
        await this.userService.addToFavorites(this.meal);
      }
      this.isFavorite = !this.isFavorite;
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la gestion des favoris.');
    }
  }

  // ✅ Génération robuste des instructions
  get instructionsList(): string[] {
    if (!this.meal?.strInstructions) return [];

    const instructions = this.meal.strInstructions.trim();

    /**
     * STEP 1, Step 1, STEP 1: description
     * + filtrage des ▢, chiffres seuls, etc.
     */
    const stepRegex =
      /(STEP\s*\d+|Step\s*\d+)\s*[:\-]?\s*(.*?)(?=(STEP\s*\d+|Step\s*\d+)|$)/gis;

    const matches = [...instructions.matchAll(stepRegex)];

    if (matches.length > 0) {
      return matches
        .map(match => {
          const stepLabel = match[1].trim(); // STEP 1
          const desc = match[2]?.trim();

          if (!desc || desc === '▢' || !/[a-zA-Z]/.test(desc)) {
            return null;
          }

          return `${stepLabel}: ${desc}`;
        })
        .filter(Boolean) as string[];
    }

    // 🔹 Cas instructions longues sans STEP
    const linesOrSentences = instructions
      .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== '▢' && /[a-zA-Z]/.test(s));

    return linesOrSentences.map((s, i) => {
      const isAlreadyNumbered = /^(\d+[\.\)]|Step\s*\d+)/i.test(s);
      return isAlreadyNumbered ? s : `Step ${i + 1}: ${s}`;
    });
  }
}
