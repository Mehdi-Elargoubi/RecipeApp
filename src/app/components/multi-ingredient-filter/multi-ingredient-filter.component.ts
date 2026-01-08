import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-multi-ingredient-filter',
  templateUrl: './multi-ingredient-filter.component.html',
  styleUrls: ['./multi-ingredient-filter.component.css']
})
export class MultiIngredientFilterComponent implements OnInit {

  ingredients: string[] = [];
  suggestions: string[] = [];
  selectedIngredients: string[] = [];

  ingredientSearch = '';
  filteredMeals: any[] = [];

  loading = false;
  error: string | null = null;

  constructor(
      private api: ApiService,
      private router: Router,
      private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadIngredients();

    this.route.queryParams.subscribe(params => {
      if (params['ingredients']) {
        this.selectedIngredients = params['ingredients'].split(',');
        this.applyFilter();
      }
    });
  }

  updateUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        ingredients: this.selectedIngredients.join(',')
      },
      queryParamsHandling: 'merge'
    });
  }

  // 🔹 Charger tous les ingrédients
  loadIngredients(): void {
    this.api.getAllIngredients().subscribe({
      next: (data) => {
        this.ingredients = data
          .map((i: any) => i.strIngredient)
          .filter((i: string) => i && i.trim().length > 0);
      },
      error: () => {
        this.error = 'Impossible de charger les ingrédients';
      }
    });
  }

  // 🔍 Autocomplete
  filterSuggestions(): void {
    const term = this.ingredientSearch.toLowerCase();

    this.suggestions = this.ingredients
      .filter(ing =>
        ing.toLowerCase().includes(term) &&
        !this.selectedIngredients.includes(ing)
      )
      .slice(0, 8);
  }

  // ➕ Ajouter ingrédient
  addIngredient(ingredient: string): void {
    if (!this.selectedIngredients.includes(ingredient)) {
      this.selectedIngredients.push(ingredient);
      this.ingredientSearch = '';
      this.suggestions = [];
      this.applyFilter();
      this.updateUrl(); // 👈 AJOUT
    }
  }


  // ❌ Supprimer ingrédient
  removeIngredient(ingredient: string): void {
    this.selectedIngredients =
      this.selectedIngredients.filter(i => i !== ingredient);

    this.applyFilter();
    this.updateUrl();
  }

  // Filtrer les repas
  applyFilter(): void {
    if (this.selectedIngredients.length === 0) {
      this.filteredMeals = [];
      this.updateUrl(); 
      return;
    }

    this.loading = true;

    const requests = this.selectedIngredients.map(ing =>
      this.api.getMealsByIngredient(ing)
    );

    Promise.all(requests.map(r => r.toPromise()))
      .then(results => {
        const mealMaps = results.map(res =>
          res?.map((m: any) => m.idMeal) || []
        );

        const commonIds = mealMaps.reduce((a, b) =>
          a.filter(id => b.includes(id))
        );

        this.filteredMeals = results[0]
          ? results[0].filter((m: any) => commonIds.includes(m.idMeal))
          : [];

        this.loading = false;
      })
      .catch(() => {
        this.error = 'Erreur lors du filtrage';
        this.loading = false;
      });
  }


}
