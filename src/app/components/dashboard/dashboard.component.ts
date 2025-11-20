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
  searchName: string = ''; 
  
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadMeals();
  }

  
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


  // Recherche par nom
  searchMeals() {
    this.loading = true;
    this.api.searchMealByName(this.searchName).subscribe({
      next: (data) => {
        this.meals = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Erreur lors de la recherche.";
        this.loading = false;
        console.error(err);
      }
    });
  }

  showInstructions(instructions: string) {
    window.alert(instructions);
  }
}


