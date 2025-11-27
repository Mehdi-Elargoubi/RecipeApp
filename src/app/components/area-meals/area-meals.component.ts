import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api/api.service';
import { Meal } from '../../models/meal.model';

@Component({
  selector: 'app-area-meals',
  templateUrl: './area-meals.component.html',
  styleUrl: './area-meals.component.css'
})
export class AreaMealsComponent {

  area!: string;
  meals: Meal[] = [];
  loading = true;

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  ngOnInit(): void {
    this.area = this.route.snapshot.paramMap.get('area')!;
    this.loadMeals();
  }

  loadMeals() {
    this.api.getMealsByArea(this.area).subscribe({
      next: (data) => {
        this.meals = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }
}
