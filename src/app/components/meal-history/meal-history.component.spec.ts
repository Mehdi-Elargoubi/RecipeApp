import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MealHistoryComponent } from './meal-history.component';

describe('MealHistoryComponent', () => {
  let component: MealHistoryComponent;
  let fixture: ComponentFixture<MealHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MealHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MealHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
