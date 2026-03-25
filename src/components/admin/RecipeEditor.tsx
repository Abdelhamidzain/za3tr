import { useState, useEffect } from 'react';
import { supabase, supabaseUrl, generateImage, inputStyle, textareaStyle, btnPrimary, btnSecondary, labelStyle, cardStyle } from './adminUtils';

const CATEGORIES = ['ramen', 'sushi', 'tempura', 'donburi', 'curry', 'noodles', 'desserts', 'appetizers', 'side-dish', 'soup', 'rice', 'drinks'];
const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const emptyRecipe = {
  slug: '', title_en: '', title_jp: '', description_en: '', description_jp: '',
  content_en: '', content_jp: '', prep_time: 15, cook_time: 30, servings: 4,
  difficulty: 'beginner', category: 'main-dish', sub_category: '',
  cuisine_tags: ['japanese'], dietary_tags: [], season_tags: [],
  calories: null, protein: null, carbs: null, fat: null,
  meta_title_en: '', meta_description_en: '', meta_title_jp: '', meta_description_jp: '',
  target_keyword_en: '', target_keyword_jp: '', secondary_keywords: [],
  uniqueness_reason: '', proof_source: '',
  hero_image_url: '', hero_image_prompt: '', step_images: [],
  status: 'draft',
};

export default function RecipeEditor({ recipeId, onBack }: { recipeId?: string; onBack: () => void }) {
  const [recipe, setRecipe] = useState<any>({ ...emptyRecipe });
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [allIngredients, setAllIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(!!recipeId);
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageMsg, setImageMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState({ cuisine: '', dietary: '', season: '' });

  const isEdit = !!recipeId;

  useEffect(() => {
    loadAllIngredients();
    if (recipeId) loadRecipe(recipeId);
  }, [recipeId]);

  const loadAllIngredients = async () => {
    const { data } = await supabase.from('ingredients').select('id, name_en, name_jp, slug').order('name_en');
    setAllIngredients(data || []);
  };

  const loadRecipe = async (id: string) => {
    setLoading(true);
    const { data: r } = await supabase.from('recipes').select('*').eq('id', id).single();
    if (r) setRecipe(r);

    const { data: ri } = await supabase.from('recipe_ingredients')
      .select('*, ingredient:ingredients(id, name_en, name_jp, slug)')
      .eq('recipe_id', id).order('sort_order');
    setIngredients(ri || []);
    setLoading(false);
  };

  const updateField = (field: string, value: any) => {
    setRecipe((prev: any) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const autoSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };

  const handleSave = async (status?: string) => {
    setSaving(true);
    const toSave = { ...recipe };
    if (status) toSave.status = status;
    if (status === 'published' && !toSave.published_at) toSave.published_at = new Date().toISOString();
    if (!toSave.slug) toSave.slug = autoSlug(toSave.title_en);
    if (!toSave.meta_title_en) toSave.meta_title_en = `${toSave.title_en} Recipe`;
    if (!toSave.hero_image_prompt) {
      toSave.hero_image_prompt = `Professional food photography of ${toSave.title_en}, Japanese cuisine, overhead shot, natural lighting, ceramic plate, warm tones`;
    }

    // Remove generated columns
    delete toSave.total_time;

    try {
      if (isEdit) {
        const { error } = await supabase.from('recipes').update(toSave).eq('id', recipeId);
        if (error) throw error;
      } else {
        delete toSave.id;
        const { data, error } = await supabase.from('recipes').insert(toSave).select('id').single();
        if (error) throw error;
        if (data) {
          // Save ingredient links
          if (ingredients.length > 0) {
            const links = ingredients.map((ing, i) => ({
              recipe_id: data.id,
              ingredient_id: ing.ingredient_id || ing.ingredient?.id,
              amount: ing.amount,
              unit: ing.unit,
              notes: ing.notes,
              is_optional: ing.is_optional || false,
              sort_order: i,
            })).filter(l => l.ingredient_id);

            if (links.length > 0) {
              await supabase.from('recipe_ingredients').insert(links);
            }
          }
        }
      }

      // Save ingredient links for existing recipe
      if (isEdit) {
        await supabase.from('recipe_ingredients').delete().eq('recipe_id', recipeId);
        const links = ingredients.map((ing, i) => ({
          recipe_id: recipeId,
          ingredient_id: ing.ingredient_id || ing.ingredient?.id,
          amount: ing.amount,
          unit: ing.unit,
          notes: ing.notes,
          is_optional: ing.is_optional || false,
          sort_order: i,
        })).filter(l => l.ingredient_id);

        if (links.length > 0) {
          await supabase.from('recipe_ingredients').insert(links);
        }
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!recipeId && !recipe.id) {
      alert('Save the recipe first before generating an image');
      return;
    }
    setGeneratingImage(true);
    setImageMsg('Generating with Freepik AI...');
    try {
      const result = await generateImage(recipeId || recipe.id);
      if (result.success && result.results?.[0]?.image_url) {
        updateField('hero_image_url', result.results[0].image_url);
        setImageMsg('Image generated successfully!');
        // Reload to get updated URL
        if (recipeId) loadRecipe(recipeId);
      } else {
        setImageMsg('Failed: ' + (result.error || result.results?.[0]?.error || 'Unknown error'));
      }
    } catch (err: any) {
      setImageMsg('Error: ' + err.message);
    } finally {
      setGeneratingImage(false);
      setTimeout(() => setImageMsg(''), 5000);
    }
  };

  // Ingredient management
  const addIngredient = () => {
    setIngredients([...ingredients, {
      ingredient_id: '', ingredient: null,
      amount: '', unit: '', notes: '', is_optional: false, sort_order: ingredients.length,
    }]);
  };

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients];
    if (field === 'ingredient_id') {
      const found = allIngredients.find(i => i.id === value);
      updated[index] = { ...updated[index], ingredient_id: value, ingredient: found };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addTag = (type: 'cuisine' | 'dietary' | 'season') => {
    const fieldMap = { cuisine: 'cuisine_tags', dietary: 'dietary_tags', season: 'season_tags' };
    const val = tagInput[type].trim();
    if (!val) return;
    const field = fieldMap[type];
    const current = recipe[field] || [];
    if (!current.includes(val)) {
      updateField(field, [...current, val]);
    }
    setTagInput({ ...tagInput, [type]: '' });
  };

  const removeTag = (type: string, index: number) => {
    const current = [...(recipe[type] || [])];
    current.splice(index, 1);
    updateField(type, current);
  };

  if (loading) return <p style={{ padding: 40, color: '#888' }}>Loading recipe...</p>;

  const tabs = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'content', label: 'Content' },
    { id: 'ingredients', label: `Ingredients (${ingredients.length})` },
    { id: 'seo', label: 'SEO' },
    { id: 'media', label: 'Images' },
    { id: 'nutrition', label: 'Nutrition' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={onBack} style={{ ...btnSecondary, padding: '8px 16px' }}>← Back</button>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>{isEdit ? 'Edit Recipe' : 'New Recipe'}</h1>
          {saved && <span style={{ fontSize: 13, color: '#2E7D32', background: '#E8F5E9', padding: '4px 12px', borderRadius: 6 }}>✓ Saved</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => handleSave('draft')} disabled={saving} style={{ ...btnSecondary, opacity: saving ? 0.6 : 1 }}>Save Draft</button>
          <button onClick={() => handleSave('review')} disabled={saving} style={{ ...btnSecondary, background: '#FFF3E0', color: '#E65100', opacity: saving ? 0.6 : 1 }}>Save as Review</button>
          <button onClick={() => handleSave('published')} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '2px solid #f0f0f0', paddingBottom: 0 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 20px', border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              background: activeTab === tab.id ? 'white' : 'transparent',
              color: activeTab === tab.id ? '#B85C38' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #B85C38' : '2px solid transparent',
              marginBottom: -2, borderRadius: '8px 8px 0 0',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Basic Info */}
      {activeTab === 'basic' && (
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Title (English) *</label>
              <input value={recipe.title_en} onChange={e => { updateField('title_en', e.target.value); if (!isEdit) updateField('slug', autoSlug(e.target.value)); }}
                style={inputStyle} placeholder="Authentic Miso Ramen" />
            </div>
            <div>
              <label style={labelStyle}>Title (Japanese)</label>
              <input value={recipe.title_jp || ''} onChange={e => updateField('title_jp', e.target.value)}
                style={inputStyle} placeholder="味噌ラーメン" />
            </div>
            <div>
              <label style={labelStyle}>Slug *</label>
              <input value={recipe.slug} onChange={e => updateField('slug', e.target.value)}
                style={inputStyle} placeholder="authentic-miso-ramen" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={recipe.category || ''} onChange={e => updateField('category', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Difficulty</label>
              <select value={recipe.difficulty || 'beginner'} onChange={e => updateField('difficulty', e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sub-Category</label>
              <input value={recipe.sub_category || ''} onChange={e => updateField('sub_category', e.target.value)}
                style={inputStyle} placeholder="e.g., miso-ramen" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <label style={labelStyle}>Prep Time (min)</label>
              <input type="number" value={recipe.prep_time || ''} onChange={e => updateField('prep_time', Number(e.target.value) || null)}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cook Time (min)</label>
              <input type="number" value={recipe.cook_time || ''} onChange={e => updateField('cook_time', Number(e.target.value) || null)}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Servings</label>
              <input type="number" value={recipe.servings || ''} onChange={e => updateField('servings', Number(e.target.value) || null)}
                style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Description (English)</label>
            <textarea value={recipe.description_en || ''} onChange={e => updateField('description_en', e.target.value)}
              style={{ ...textareaStyle, minHeight: 80 }} placeholder="Brief description of the recipe..." />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Description (Japanese)</label>
            <textarea value={recipe.description_jp || ''} onChange={e => updateField('description_jp', e.target.value)}
              style={{ ...textareaStyle, minHeight: 80 }} placeholder="レシピの説明..." />
          </div>

          {/* Tags */}
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            {(['cuisine', 'dietary', 'season'] as const).map(type => {
              const field = `${type}_tags` as const;
              return (
                <div key={type}>
                  <label style={labelStyle}>{type.charAt(0).toUpperCase() + type.slice(1)} Tags</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input value={tagInput[type]} onChange={e => setTagInput({ ...tagInput, [type]: e.target.value })}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(type))}
                      style={{ ...inputStyle, flex: 1 }} placeholder="Add tag..." />
                    <button onClick={() => addTag(type)} style={{ ...btnSecondary, padding: '8px 12px' }}>+</button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {(recipe[field] || []).map((tag: string, i: number) => (
                      <span key={i} style={{ fontSize: 12, padding: '2px 8px', background: '#F5E6D3', color: '#A87B52', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {tag}
                        <button onClick={() => removeTag(field, i)} style={{ background: 'none', border: 'none', color: '#A87B52', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: Content */}
      {activeTab === 'content' && (
        <div style={cardStyle}>
          <div>
            <label style={labelStyle}>Instructions / Steps (English) — one step per line</label>
            <textarea value={recipe.content_en || ''} onChange={e => updateField('content_en', e.target.value)}
              style={{ ...textareaStyle, minHeight: 300 }}
              placeholder="Step 1: Prepare the ingredients...&#10;Step 2: Heat the pan...&#10;Step 3: ..." />
            <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{(recipe.content_en || '').split('\n').filter((s: string) => s.trim()).length} steps</p>
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Instructions (Japanese)</label>
            <textarea value={recipe.content_jp || ''} onChange={e => updateField('content_jp', e.target.value)}
              style={{ ...textareaStyle, minHeight: 200 }} placeholder="手順1: ..." />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Uniqueness Reason</label>
            <textarea value={recipe.uniqueness_reason || ''} onChange={e => updateField('uniqueness_reason', e.target.value)}
              style={{ ...textareaStyle, minHeight: 60 }} placeholder="What makes this recipe different from others online?" />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={labelStyle}>Proof / Source</label>
            <input value={recipe.proof_source || ''} onChange={e => updateField('proof_source', e.target.value)}
              style={inputStyle} placeholder="Cultural context, technique reference..." />
          </div>
        </div>
      )}

      {/* TAB: Ingredients */}
      {activeTab === 'ingredients' && (
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recipe Ingredients</h3>
            <button onClick={addIngredient} style={{ ...btnPrimary, padding: '8px 16px', background: '#4A7C59' }}>+ Add Ingredient</button>
          </div>

          {ingredients.length === 0 && (
            <p style={{ padding: 30, textAlign: 'center', color: '#888', background: '#f8f8f8', borderRadius: 8 }}>No ingredients yet. Click "Add Ingredient" to start.</p>
          )}

          {ingredients.map((ing, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5' }}>
              <span style={{ fontSize: 13, color: '#aaa', width: 24 }}>{i + 1}</span>
              <select value={ing.ingredient_id || ing.ingredient?.id || ''} onChange={e => updateIngredient(i, 'ingredient_id', e.target.value)}
                style={{ ...inputStyle, flex: 2, padding: '8px 10px' }}>
                <option value="">Select ingredient...</option>
                {allIngredients.map(ai => <option key={ai.id} value={ai.id}>{ai.name_en} {ai.name_jp ? `(${ai.name_jp})` : ''}</option>)}
              </select>
              <input value={ing.amount || ''} onChange={e => updateIngredient(i, 'amount', e.target.value)}
                style={{ ...inputStyle, flex: 0.5, padding: '8px 10px' }} placeholder="Amount" />
              <input value={ing.unit || ''} onChange={e => updateIngredient(i, 'unit', e.target.value)}
                style={{ ...inputStyle, flex: 0.5, padding: '8px 10px' }} placeholder="Unit" />
              <input value={ing.notes || ''} onChange={e => updateIngredient(i, 'notes', e.target.value)}
                style={{ ...inputStyle, flex: 1, padding: '8px 10px' }} placeholder="Notes" />
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={ing.is_optional || false} onChange={e => updateIngredient(i, 'is_optional', e.target.checked)} />
                Optional
              </label>
              <button onClick={() => removeIngredient(i)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {/* TAB: SEO */}
      {activeTab === 'seo' && (
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Meta Title (EN) <span style={{ color: '#aaa' }}>— max 60 chars ({(recipe.meta_title_en || '').length}/60)</span></label>
              <input value={recipe.meta_title_en || ''} onChange={e => updateField('meta_title_en', e.target.value)} maxLength={60}
                style={{ ...inputStyle, borderColor: (recipe.meta_title_en || '').length > 60 ? '#C62828' : '#ddd' }} />
            </div>
            <div>
              <label style={labelStyle}>Meta Title (JP)</label>
              <input value={recipe.meta_title_jp || ''} onChange={e => updateField('meta_title_jp', e.target.value)}
                style={inputStyle} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Meta Description (EN) <span style={{ color: '#aaa' }}>— max 155 chars ({(recipe.meta_description_en || '').length}/155)</span></label>
              <textarea value={recipe.meta_description_en || ''} onChange={e => updateField('meta_description_en', e.target.value)} maxLength={155}
                style={{ ...textareaStyle, minHeight: 60 }} />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={labelStyle}>Meta Description (JP)</label>
              <textarea value={recipe.meta_description_jp || ''} onChange={e => updateField('meta_description_jp', e.target.value)}
                style={{ ...textareaStyle, minHeight: 60 }} />
            </div>
            <div>
              <label style={labelStyle}>Target Keyword (EN)</label>
              <input value={recipe.target_keyword_en || ''} onChange={e => updateField('target_keyword_en', e.target.value)}
                style={inputStyle} placeholder="miso ramen recipe" />
            </div>
            <div>
              <label style={labelStyle}>Target Keyword (JP)</label>
              <input value={recipe.target_keyword_jp || ''} onChange={e => updateField('target_keyword_jp', e.target.value)}
                style={inputStyle} placeholder="味噌ラーメン レシピ" />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Images */}
      {activeTab === 'media' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Hero Image</h3>

          {/* Image Preview */}
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ flex: 1 }}>
              {recipe.hero_image_url ? (
                <div style={{ position: 'relative' }}>
                  <img src={recipe.hero_image_url} alt="Hero" style={{ width: '100%', borderRadius: 12, maxHeight: 300, objectFit: 'cover' }} />
                  <button onClick={() => updateField('hero_image_url', '')}
                    style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 14 }}>×</button>
                </div>
              ) : (
                <div style={{ width: '100%', height: 200, borderRadius: 12, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 14, border: '2px dashed #ddd' }}>
                  No image yet
                </div>
              )}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Image URL (or paste external link)</label>
                <input value={recipe.hero_image_url || ''} onChange={e => updateField('hero_image_url', e.target.value)}
                  style={inputStyle} placeholder="https://..." />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={labelStyle}>Freepik AI Prompt</label>
                <textarea value={recipe.hero_image_prompt || ''} onChange={e => updateField('hero_image_prompt', e.target.value)}
                  style={{ ...textareaStyle, minHeight: 80 }}
                  placeholder="Professional food photography of [dish name], Japanese cuisine, overhead shot..." />
              </div>

              <button onClick={handleGenerateImage} disabled={generatingImage || (!recipeId && !recipe.id)}
                style={{
                  ...btnPrimary, background: generatingImage ? '#ccc' : '#3D5A80',
                  display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center',
                }}>
                {generatingImage ? '🎨 Generating...' : '🎨 Generate with Freepik AI'}
              </button>
              {!recipeId && !recipe.id && (
                <p style={{ fontSize: 12, color: '#E65100', marginTop: 4 }}>Save the recipe first to generate images</p>
              )}
              {imageMsg && <p style={{ fontSize: 13, color: imageMsg.includes('success') ? '#2E7D32' : '#E65100', marginTop: 8, padding: '6px 10px', background: imageMsg.includes('success') ? '#E8F5E9' : '#FFF3E0', borderRadius: 6 }}>{imageMsg}</p>}
            </div>
          </div>
        </div>
      )}

      {/* TAB: Nutrition */}
      {activeTab === 'nutrition' && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Nutrition Facts (per serving)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Calories</label>
              <input type="number" value={recipe.calories || ''} onChange={e => updateField('calories', Number(e.target.value) || null)}
                style={inputStyle} placeholder="450" />
            </div>
            <div>
              <label style={labelStyle}>Protein (g)</label>
              <input type="number" value={recipe.protein || ''} onChange={e => updateField('protein', Number(e.target.value) || null)}
                style={inputStyle} placeholder="25" />
            </div>
            <div>
              <label style={labelStyle}>Carbs (g)</label>
              <input type="number" value={recipe.carbs || ''} onChange={e => updateField('carbs', Number(e.target.value) || null)}
                style={inputStyle} placeholder="50" />
            </div>
            <div>
              <label style={labelStyle}>Fat (g)</label>
              <input type="number" value={recipe.fat || ''} onChange={e => updateField('fat', Number(e.target.value) || null)}
                style={inputStyle} placeholder="15" />
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div style={{ background: 'white', borderRadius: 12, padding: '12px 20px', border: '1px solid #f0f0f0', marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 13, color: '#888' }}>
          Status: <span style={{
            fontWeight: 600,
            color: recipe.status === 'published' ? '#2E7D32' : recipe.status === 'review' ? '#E65100' : '#888'
          }}>{recipe.status}</span>
          {recipe.slug && <span> | Slug: <code style={{ background: '#f0f0f0', padding: '1px 6px', borderRadius: 3, fontSize: 12 }}>{recipe.slug}</code></span>}
          {recipe.total_time && <span> | Total Time: {recipe.total_time}min</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {recipe.slug && recipe.status === 'published' && (
            <a href={`/recipes/${recipe.slug}`} target="_blank" style={{ fontSize: 13, color: '#B85C38' }}>View on site ↗</a>
          )}
        </div>
      </div>
    </div>
  );
}
