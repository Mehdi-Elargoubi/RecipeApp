import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-ingredient-meals',
  templateUrl: './ingredient-meals.component.html',
  styleUrl: './ingredient-meals.component.css'
})
export class IngredientMealsComponent {

  ingredient!: string;
  meals: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.ingredient = this.route.snapshot.params['ingredient'];
    this.loadMeals();
  }

  loadMeals() {
    this.api.getMealsByIngredient(this.ingredient).subscribe({
      next: (data) => {
        this.meals = data;
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les plats.";
        this.loading = false;
      }
    });
  }
}
