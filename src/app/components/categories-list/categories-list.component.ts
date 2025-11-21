import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories-list',
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.css'
})
export class CategoriesListComponent {

  categories: Category[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.api.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les catégories.';
        this.loading = false;
      }
    });
  }
}
