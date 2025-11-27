import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './core/auth.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { AllMealsComponent } from './components/all-meals/all-meals.component';
import { AreasListComponent } from './components/areas-list/areas-list.component';
import { AreaMealsComponent } from './components/area-meals/area-meals.component';
import { CategoryMealsComponent } from './components/category-meals/category-meals.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path:'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'all-meals', component: AllMealsComponent },
  { path: 'categories', component: CategoriesListComponent },
  { path: 'areas', component: AreasListComponent },  
  { path: 'areas/:area', component: AreaMealsComponent },
  { path: 'categories/:category', component: CategoryMealsComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
