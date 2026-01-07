export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  ingredients: Ingredient[];

  note?: string;
}


export interface Ingredient {
  name: string;
  measure: string;
}

