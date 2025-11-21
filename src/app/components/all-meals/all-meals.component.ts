import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-all-meals',
  templateUrl: './all-meals.component.html',
  styleUrl: './all-meals.component.css'
})
export class AllMealsComponent {

    meals: Meal[] = [];
  loading = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAllMeals();
  }

  loadAllMeals() {
    this.loading = true;

    this.api.getAllMeals().subscribe({
      next: (data) => {
        this.meals = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement de toutes les recettes.";
        this.loading = false;
        console.error(err);
      }
    });
  }

  showInstructions(text: string) {
    window.alert(text);
  }
}
