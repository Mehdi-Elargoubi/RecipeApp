import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';

@Component({
  selector: 'app-ingredients-list',
  templateUrl: './ingredients-list.component.html',
  styleUrl: './ingredients-list.component.css'
})
export class IngredientsListComponent {

  ingredients: any[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadIngredients();
  }

  loadIngredients() {
    this.api.getAllIngredients().subscribe({
      next: (data) => {
        this.ingredients = data;
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les ingrédients.";
        this.loading = false;
      }
    });
  }
}
