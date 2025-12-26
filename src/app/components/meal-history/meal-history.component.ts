import { Component, OnInit } from '@angular/core';
import { Meal } from '../../models/meal.model';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meal-history',
  templateUrl: './meal-history.component.html',
  styleUrl: './meal-history.component.css'
})
export class MealHistoryComponent implements OnInit  {

  visitedMeals: Meal[] = [];
  loading = true;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVisitedMeals();
  }

  async loadVisitedMeals() {
    this.loading = true;
    this.visitedMeals = await this.userService.getVisitedMeals();
    this.loading = false;
  }

  goToMeal(id: string) {
    this.router.navigate(['/meal', id]);
  }
  
}
