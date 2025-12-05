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
  instructionsList: string[] = [];

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    const mealId = this.route.snapshot.paramMap.get('id');
    if (mealId) {
      this.api.getMealById(mealId).subscribe({
        next: (data) => {
          this.meal = data;
          this.instructionsList = this.parseInstructions(data.strInstructions);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Impossible de charger le plat.';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  private parseInstructions(instr: string): string[] {
    if (!instr) return [];
    // On split sur les sauts de ligne (Windows \r\n et Linux/Unix \n)
    return instr.split(/\r?\n/).filter(step => step.trim() !== '');
  }

}
