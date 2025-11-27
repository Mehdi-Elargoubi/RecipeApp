import { Component } from '@angular/core';
import { ApiService } from '../../services/api/api.service';
import { Area } from '../../models/area.model';

@Component({
  selector: 'app-areas-list',
  templateUrl: './areas-list.component.html',
  styleUrl: './areas-list.component.css'
})
export class AreasListComponent {

    areas: Area[] = [];
  loading: boolean = true;
  error: string | null = null;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadAreas();
  }

  loadAreas() {
    this.loading = true;
    this.api.getAllAreas().subscribe({
      next: (data: Area[]) => {
        this.areas = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = "Impossible de charger les régions culinaires.";
        this.loading = false;
        console.error(err);
      }
    });
  }

  selectArea(area: string) {
    alert(`Tu as sélectionné : ${area}`);
  }

}
