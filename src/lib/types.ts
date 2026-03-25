// Auto-generated Supabase types for Za3tr.com
// Generated: March 25, 2026
// Project: doswprgdalotithjdjkc

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string
          slug: string
          title_en: string
          title_jp: string | null
          description_en: string | null
          description_jp: string | null
          content_en: string | null
          content_jp: string | null
          prep_time: number | null
          cook_time: number | null
          total_time: number | null
          servings: number | null
          difficulty: string | null
          category: string | null
          sub_category: string | null
          cuisine_tags: string[] | null
          dietary_tags: string[] | null
          season_tags: string[] | null
          calories: number | null
          protein: number | null
          carbs: number | null
          fat: number | null
          meta_title_en: string | null
          meta_title_jp: string | null
          meta_description_en: string | null
          meta_description_jp: string | null
          target_keyword_en: string | null
          target_keyword_jp: string | null
          secondary_keywords: string[] | null
          uniqueness_reason: string | null
          proof_source: string | null
          hero_image_url: string | null
          hero_image_prompt: string | null
          step_images: Json | null
          status: string | null
          published_at: string | null
          scheduled_at: string | null
          last_refreshed_at: string | null
          pageviews: number | null
          avg_position: number | null
          bounce_rate: number | null
          clicks: number | null
          impressions: number | null
          created_at: string | null
          updated_at: string | null
        }
      }
      ingredients: {
        Row: {
          id: string
          name_en: string
          name_jp: string | null
          slug: string
          description_en: string | null
          description_jp: string | null
          category: string | null
          image_url: string | null
          substitutes: string[] | null
          where_to_buy: string | null
          nutritional_info: Json | null
          page_generated: boolean | null
          created_at: string | null
          updated_at: string | null
        }
      }
      recipe_ingredients: {
        Row: {
          id: string
          recipe_id: string
          ingredient_id: string
          amount: string | null
          unit: string | null
          notes: string | null
          is_optional: boolean | null
          sort_order: number | null
        }
      }
      keywords_queue: {
        Row: {
          id: string
          keyword: string
          language: string | null
          search_volume: number | null
          difficulty: number | null
          intent: string | null
          status: string | null
          priority: number | null
          assigned_recipe_id: string | null
          source: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      comparison_pages: {
        Row: {
          id: string
          item_a: string
          item_b: string
          slug: string
          title_en: string | null
          title_jp: string | null
          content_en: string | null
          content_jp: string | null
          meta_description_en: string | null
          meta_description_jp: string | null
          faq_data: Json | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      collection_pages: {
        Row: {
          id: string
          title_en: string
          title_jp: string | null
          slug: string
          description_en: string | null
          description_jp: string | null
          recipe_ids: string[] | null
          type: string | null
          meta_description_en: string | null
          meta_description_jp: string | null
          status: string | null
          created_at: string | null
          updated_at: string | null
        }
      }
      automation_log: {
        Row: {
          id: string
          action_type: string
          edge_function: string | null
          details: Json | null
          status: string | null
          error_message: string | null
          duration_ms: number | null
          created_at: string | null
        }
      }
      site_settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_at: string | null
        }
      }
    }
    Functions: {
      get_dashboard_stats: { Args: Record<string, never>; Returns: Json }
      get_next_keywords: { Args: { batch_size?: number }; Returns: Database['public']['Tables']['keywords_queue']['Row'][] }
      get_recipe_with_ingredients: { Args: { recipe_slug: string }; Returns: Json }
      publish_scheduled_recipes: { Args: Record<string, never>; Returns: number }
    }
  }
}
