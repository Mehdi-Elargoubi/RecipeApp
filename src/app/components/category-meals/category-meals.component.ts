import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-category-meals',
  templateUrl: './category-meals.component.html',
  styleUrl: './category-meals.component.css'
})
export class CategoryMealsComponent {

    category: string | null = null;
  meals: Meal[] = [];
  loading = true;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.category = this.route.snapshot.paramMap.get('category');
    if (this.category) {
      this.loadMealsByCategory(this.category);
    }
  }

  loadMealsByCategory(category: string): void {
    this.loading = true;
    this.api.filterByCategory(category).subscribe({
      next: (data) => {
        this.meals = data;
        this.loading = false;
      },
      error: () => {
        this.error = `Impossible de charger les plats pour ${category}.`;
        this.loading = false;
      }
    });
  }

  showInstructions(instructions: string): void {
    window.alert(instructions);
  }
  
}
