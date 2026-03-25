import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || 'https://doswprgdalotithjdjkc.supabase.co';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3dwcmdkYWxvdGl0aGpkamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjA4NjUsImV4cCI6MjA5MDAzNjg2NX0.dS1MZ_YV7Yi5JpQ67pIRgYDGXTESBxT1_Js3BMx7C8Y';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper: Fetch all published recipes
export async function getPublishedRecipes(limit?: number) {
  let query = supabase
    .from('recipes')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  
  if (limit) query = query.limit(limit);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Helper: Fetch single recipe by slug
export async function getRecipeBySlug(slug: string) {
  const { data, error } = await supabase
    .rpc('get_recipe_with_ingredients', { recipe_slug: slug });
  
  if (error) throw error;
  return data;
}

// Helper: Fetch all published recipes for static paths
export async function getAllRecipeSlugs() {
  const { data, error } = await supabase
    .from('recipes')
    .select('slug')
    .eq('status', 'published');
  
  if (error) throw error;
  return data?.map(r => r.slug) || [];
}

// Helper: Fetch recipes by category
export async function getRecipesByCategory(category: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select('*')
    .eq('status', 'published')
    .eq('category', category)
    .order('published_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

// Helper: Fetch all ingredients
export async function getAllIngredients() {
  const { data, error } = await supabase
    .from('ingredients')
    .select('*')
    .order('name_en');
  
  if (error) throw error;
  return data;
}

// Helper: Fetch ingredient by slug with related recipes
export async function getIngredientBySlug(slug: string) {
  const { data: ingredient, error: iError } = await supabase
    .from('ingredients')
    .select('*')
    .eq('slug', slug)
    .single();
  
  if (iError) throw iError;
  
  // Get recipes using this ingredient
  const { data: recipeLinks, error: rlError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .eq('ingredient_id', ingredient.id);
  
  if (rlError) throw rlError;
  
  const recipeIds = recipeLinks?.map(rl => rl.recipe_id) || [];
  
  let recipes: any[] = [];
  if (recipeIds.length > 0) {
    const { data, error } = await supabase
      .from('recipes')
      .select('id, slug, title_en, title_jp, hero_image_url, category, difficulty, total_time')
      .eq('status', 'published')
      .in('id', recipeIds);
    
    if (!error) recipes = data || [];
  }
  
  return { ingredient, recipes };
}

// Helper: Get categories with recipe counts
export async function getCategoriesWithCounts() {
  const { data, error } = await supabase
    .from('recipes')
    .select('category')
    .eq('status', 'published');
  
  if (error) throw error;
  
  const counts: Record<string, number> = {};
  data?.forEach(r => {
    if (r.category) {
      counts[r.category] = (counts[r.category] || 0) + 1;
    }
  });
  
  return counts;
}
