import { Component } from '@angular/core';
import { Meal } from '../../models/meal.model';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-meal-details',
  templateUrl: './meal-details.component.html',
  styleUrl: './meal-details.component.css'
})
export class MealDetailsComponent {

  meal!: Meal;
  loading: boolean = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const mealId = this.route.snapshot.paramMap.get('id');
    if (mealId) {
      this.api.getMealById(mealId).subscribe({
        next: (data) => {
          this.meal = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = "Impossible de charger les instructions.";
          console.error(err);
          this.loading = false;
        }
      });
    }
  }

  // ✅ Méthode pour générer une liste d'instructions robuste
  get instructionsList(): string[] {
  if (!this.meal?.strInstructions) return [];

  const instructions = this.meal.strInstructions.trim();

  // Regex pour détecter STEP ou Step avec numéro et capturer la description
  const stepRegex = /(STEP\s*\d+|Step\s*\d+)\s*[:\-]?\s*(.*?)(?=(STEP\s*\d+|Step\s*\d+)|$)/gis;

  const matches = [...instructions.matchAll(stepRegex)];

  if (matches.length > 0) {
    return matches
      .map(m => {
        const stepLabel = m[1].trim(); // "STEP 1"
        let desc = m[2].trim();        // description

        // Filtrer si la description est vide, juste ▢, ou trop courte sans lettres
        if (!desc || desc === '▢' || !/[a-zA-Z]/.test(desc)) {
          return null;
        }

        return `${stepLabel}: ${desc}`;
      })
      .filter(step => step !== null) as string[];
  } else {
    // Cas sans STEP ou instructions longues
    const linesOrSentences = instructions
      .split(/\r?\n|(?<=\.)\s+(?=[A-Z])/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && s !== '▢' && /[a-zA-Z]/.test(s)); // filtrer les chiffres seuls

    return linesOrSentences.map((s, i) => {
      const isAlreadyNumbered = /^(\d+[\.\)]|Step\s*\d+)/i.test(s);
      return isAlreadyNumbered ? s : `Step ${i + 1}: ${s}`;
    });
  }
}

  



}
