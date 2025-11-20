import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { Meal } from '../../models/meal.model';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  meals: Meal[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadMeals();
  }

  // loadMeals() {
  //   this.loading = true;
  //   this.http.get("https://www.themealdb.com/api/json/v1/1/search.php?s=")
  //     .subscribe({
  //       next: (data: any) => {
  //         this.meals = data.meals || [];
  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         console.error(err);
  //         this.error = "Impossible de charger les recettes. Réessayez plus tard.";
  //         this.loading = false;
  //       }
  //     });
  // }

  // 👈 Méthode pour afficher les instructions
  
  
    loadMeals() {
    this.loading = true;
    this.api.searchMealByName('').subscribe({
      next: (data) => {
        this.meals = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Impossible de charger les recettes.";
        this.loading = false;
        console.error(err);
      }
    });
  }

  showInstructions(instructions: string) {
    window.alert(instructions);
  }
}


