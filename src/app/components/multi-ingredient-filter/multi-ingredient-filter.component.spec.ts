import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiIngredientFilterComponent } from './multi-ingredient-filter.component';

describe('MultiIngredientFilterComponent', () => {
  let component: MultiIngredientFilterComponent;
  let fixture: ComponentFixture<MultiIngredientFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MultiIngredientFilterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiIngredientFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
