import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';           // ← Ajouté : pour slice, ngIf, ngFor...
import { RouterModule } from '@angular/router';           // ← Ajouté : pour routerLink et router-outletimport { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AllMealsComponent } from './components/all-meals/all-meals.component';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { AreasListComponent } from './components/areas-list/areas-list.component';
import { AreaMealsComponent } from './components/area-meals/area-meals.component';
import { CategoryMealsComponent } from './components/category-meals/category-meals.component';
import { IngredientsListComponent } from './components/ingredients-list/ingredients-list.component';
import { IngredientMealsComponent } from './components/ingredient-meals/ingredient-meals.component';
import { MealDetailsComponent } from './components/meal-details/meal-details.component';
import { MultiIngredientFilterComponent } from './components/multi-ingredient-filter/multi-ingredient-filter.component';

// Firebase
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideFunctions, getFunctions } from '@angular/fire/functions';
import { environment } from './../environments/environment';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { ProfileComponent } from './components/profile/profile.component';
import { FavoritesComponent } from './components/favorites/favorites.component';
import { MealHistoryComponent } from './components/meal-history/meal-history.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard/admin-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    ForgotPasswordComponent,
    AllMealsComponent,
    CategoriesListComponent,
    AreasListComponent,
    AreaMealsComponent,
    CategoryMealsComponent,
    IngredientsListComponent,
    IngredientMealsComponent,
    MealDetailsComponent,
    MultiIngredientFilterComponent,
    ProfileComponent,
    FavoritesComponent,
    MealHistoryComponent,
    AdminDashboardComponent,
    ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,          // ← Contient probablement RouterModule.forRoot(...)
    CommonModule,              // ← Indispensable pour pipe slice, ngFor, ngIf...
    FormsModule,               // ← Pour [(ngModel)]
    ReactiveFormsModule,       // ← Pour [formGroup]
    FormsModule,               // ← Pour les formulaires template-driven
    // Pas de RouterModule ici si déjà dans AppRoutingModule
  ],
  providers: [
    // ← Les providers Firebase DOIVENT être ici, PAS dans imports !
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideStorage(() => getStorage())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }