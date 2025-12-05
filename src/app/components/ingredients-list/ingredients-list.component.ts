import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
//import { Ingredient } from '../../models/meal.model';
import { IngredientItem } from '../../models/ingredient.model';
import { Ingredient } from '../../models/meal.model';

@Component({
  selector: 'app-ingredients-list',
  templateUrl: './ingredients-list.component.html',
  styleUrl: './ingredients-list.component.css'
})
export class IngredientsListComponent {

  //ingredients: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  ingredients: IngredientItem[] = [];
  filteredIngredients: IngredientItem[] = [];

  searchTerm: string = "";
  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadIngredients();
  }

  loadIngredients() {
    this.api.getAllIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;

        // 👉 afficher tout dès le début
        this.filteredIngredients = this.ingredients;

        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les ingrédients.";
        this.loading = false;
      }
    });
  }


  filterIngredients(): void {
    const term = this.searchTerm.toLowerCase();

    this.filteredIngredients = this.ingredients.filter(ing =>
      ing.strIngredient.toLowerCase().includes(term)
    );
  }


}
