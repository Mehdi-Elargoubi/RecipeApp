import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Meal } from '../../models/meal.model';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  meals: Meal[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  private searchSubject: Subject<string> = new Subject<string>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadMeals();

    // Recherche en temps réel avec debounce
    this.searchSubject.pipe(
      debounceTime(500),           
      distinctUntilChanged()       
    ).subscribe(searchText => {
      this.loading = true;
      this.api.searchMealByName(searchText).subscribe({
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
    });
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

  // Appelée à chaque frappe
  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchSubject.next(input.value);
  }
  showInstructions(instructions: string) {
    window.alert(instructions);
  }
}
