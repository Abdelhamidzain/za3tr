import { useState, useEffect, useCallback } from 'react';
import { supabase, supabaseUrl, inputStyle, textareaStyle, btnPrimary, btnSecondary, labelStyle, cardStyle } from './adminUtils';
import RecipeEditor from './RecipeEditor';

// =============================================
// LOGIN COMPONENT
// =============================================
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Check your email to confirm your account!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLogin(data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0' }}>
      <div style={{ width: 400, padding: 40, background: 'white', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 48, height: 48, borderRadius: 24, background: '#B85C38', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>Z</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginTop: 12 }}>Za3tr Admin</h1>
          <p style={{ fontSize: 14, color: '#888', marginTop: 4 }}>{isSignUp ? 'Create your account' : 'Sign in to dashboard'}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' }}
              placeholder="admin@za3tr.com" />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none' }}
              placeholder="••••••••" />
          </div>

          {error && <p style={{ fontSize: 13, color: error.includes('Check') ? '#2E7D32' : '#C62828', marginBottom: 16, padding: '8px 12px', background: error.includes('Check') ? '#E8F5E9' : '#FFEBEE', borderRadius: 6 }}>{error}</p>}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '12px', background: '#B85C38', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#888', marginTop: 20 }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: '#B85C38', cursor: 'pointer', fontWeight: 500 }}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

// =============================================
// SIDEBAR COMPONENT
// =============================================
function Sidebar({ currentPage, onNavigate, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'recipes', label: 'Recipes', icon: '🍣' },
    { id: 'ai-generator', label: 'AI Generator', icon: '🤖' },
    { id: 'ingredients', label: 'Ingredients', icon: '🥢' },
    { id: 'keywords', label: 'Keywords', icon: '🔑' },
    { id: 'automation', label: 'Automation', icon: '⚡' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div style={{ width: 240, minHeight: '100vh', background: '#1A1A1A', color: 'white', padding: '20px 0', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '0 20px', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: '#B85C38', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>Z</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Za3tr</div>
          <div style={{ fontSize: 11, color: '#888' }}>Admin Dashboard</div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 20px',
              background: (currentPage === item.id || (item.id === 'recipes' && currentPage.startsWith('recipe-'))) ? 'rgba(184,92,56,0.15)' : 'transparent',
              border: 'none', color: (currentPage === item.id || (item.id === 'recipes' && currentPage.startsWith('recipe-'))) ? '#F0997B' : '#aaa',
              borderLeft: (currentPage === item.id || (item.id === 'recipes' && currentPage.startsWith('recipe-'))) ? '3px solid #B85C38' : '3px solid transparent',
              cursor: 'pointer', fontSize: 14, textAlign: 'left', transition: 'all 0.15s',
            }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            <span style={{ fontWeight: (currentPage === item.id || (item.id === 'recipes' && currentPage.startsWith('recipe-'))) ? 600 : 400 }}>{item.label}</span>
          </button>
        ))}
      </nav>

      <div style={{ padding: '0 20px' }}>
        <a href="/" target="_blank" style={{ display: 'block', padding: '8px 0', fontSize: 12, color: '#666', textDecoration: 'none' }}>
          ↗ View Site
        </a>
        <button onClick={onLogout}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 13, padding: '8px 0' }}>
          ← Sign Out
        </button>
      </div>
    </div>
  );
}

// =============================================
// STAT CARD
// =============================================
function StatCard({ label, value, color = '#B85C38' }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0' }}>
      <p style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color }}>{value}</p>
    </div>
  );
}

// =============================================
// DASHBOARD PAGE
// =============================================
function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.rpc('get_dashboard_stats');
      setStats(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p style={{ padding: 40, color: '#888' }}>Loading dashboard...</p>;
  if (!stats) return <p style={{ padding: 40, color: '#C62828' }}>Failed to load stats</p>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Recipes" value={stats.total_recipes} />
        <StatCard label="Published" value={stats.published_recipes} color="#2E7D32" />
        <StatCard label="In Review" value={stats.review_recipes} color="#E65100" />
        <StatCard label="Drafts" value={stats.draft_recipes} color="#888" />
        <StatCard label="Ingredients" value={stats.total_ingredients} color="#4A7C59" />
        <StatCard label="Keywords Queue" value={stats.queued_keywords} color="#3D5A80" />
        <StatCard label="Total Pageviews" value={stats.total_pageviews?.toLocaleString() || 0} color="#C4956A" />
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Recent Automation</h2>
      {stats.recent_automation?.length > 0 ? (
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
          {stats.recent_automation.map((log, i) => (
            <div key={i} style={{ padding: '12px 16px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14 }}>{log.action_type}</span>
              <span style={{ fontSize: 12, color: log.status === 'success' ? '#2E7D32' : '#C62828', padding: '2px 8px', background: log.status === 'success' ? '#E8F5E9' : '#FFEBEE', borderRadius: 4 }}>{log.status}</span>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: 14, color: '#888', padding: 20, background: 'white', borderRadius: 12, border: '1px solid #f0f0f0' }}>No automation logs yet. Logs will appear here when scheduled jobs run.</p>
      )}
    </div>
  );
}

// =============================================
// RECIPES PAGE
// =============================================
function RecipesPage({ onNavigate }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('recipes').select('id, slug, title_en, title_jp, category, difficulty, status, total_time, pageviews, created_at').order('created_at', { ascending: false });
    if (filter !== 'all') query = query.eq('status', filter);
    const { data } = await query;
    setRecipes(data || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { loadRecipes(); }, [loadRecipes]);

  const updateStatus = async (id, newStatus) => {
    await supabase.from('recipes').update({ status: newStatus, ...(newStatus === 'published' ? { published_at: new Date().toISOString() } : {}) }).eq('id', id);
    loadRecipes();
  };

  const deleteRecipe = async (id) => {
    if (!confirm('Delete this recipe?')) return;
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);
    await supabase.from('recipes').delete().eq('id', id);
    loadRecipes();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Recipes ({recipes.length})</h1>
        <button onClick={() => onNavigate('recipe-new')}
          style={{ padding: '10px 20px', background: '#B85C38', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + New Recipe
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'published', 'review', 'draft'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: filter === f ? '#B85C38' : '#f0f0f0', color: filter === f ? 'white' : '#666' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <p style={{ color: '#888' }}>Loading...</p> : (
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888', textTransform: 'uppercase' }}>Recipe</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, color: '#888' }}>Views</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 12, color: '#888' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f8f8f8' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{r.title_en}</div>
                    {r.title_jp && <div style={{ fontSize: 12, color: '#888' }}>{r.title_jp}</div>}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#666', textTransform: 'capitalize' }}>{r.category}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 12,
                      background: r.status === 'published' ? '#E8F5E9' : r.status === 'review' ? '#FFF3E0' : '#F5F5F5',
                      color: r.status === 'published' ? '#2E7D32' : r.status === 'review' ? '#E65100' : '#888',
                    }}>{r.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: '#666' }}>{r.pageviews || 0}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => onNavigate('recipe-edit:' + r.id)} style={{ padding: '4px 10px', fontSize: 12, background: '#F5E6D3', color: '#A87B52', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
                      {r.status === 'draft' && <button onClick={() => updateStatus(r.id, 'review')} style={{ padding: '4px 10px', fontSize: 12, background: '#FFF3E0', color: '#E65100', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Review</button>}
                      {r.status === 'review' && <button onClick={() => updateStatus(r.id, 'published')} style={{ padding: '4px 10px', fontSize: 12, background: '#E8F5E9', color: '#2E7D32', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Publish</button>}
                      {r.status === 'published' && <a href={`/recipes/${r.slug}`} target="_blank" style={{ padding: '4px 10px', fontSize: 12, background: '#E3F2FD', color: '#1565C0', borderRadius: 4, textDecoration: 'none' }}>View</a>}
                      <button onClick={() => deleteRecipe(r.id)} style={{ padding: '4px 10px', fontSize: 12, background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recipes.length === 0 && <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>No recipes found</p>}
        </div>
      )}
    </div>
  );
}

// =============================================
// AI GENERATOR PAGE
// =============================================
function AIGeneratorPage() {
  const [keyword, setKeyword] = useState('');
  const [batchSize, setBatchSize] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('single'); // single or batch

  const generateContent = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${supabaseUrl}/functions/v1/generate-content-v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(mode === 'single' ? { keyword, batch_size: 1 } : { batch_size: batchSize }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>AI Recipe Generator</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setMode('single')}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            background: mode === 'single' ? '#B85C38' : '#f0f0f0', color: mode === 'single' ? 'white' : '#666' }}>
          Single Keyword
        </button>
        <button onClick={() => setMode('batch')}
          style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 14, fontWeight: 500, cursor: 'pointer',
            background: mode === 'batch' ? '#B85C38' : '#f0f0f0', color: mode === 'batch' ? 'white' : '#666' }}>
          Batch from Queue
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #f0f0f0', marginBottom: 20 }}>
        {mode === 'single' ? (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Target Keyword</label>
            <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="e.g., tonkatsu recipe, how to make onigiri"
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 16 }} />
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Batch Size (from keyword queue)</label>
            <input type="number" value={batchSize} onChange={e => setBatchSize(Number(e.target.value))} min={1} max={10}
              style={{ width: 100, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, marginBottom: 16 }} />
          </div>
        )}

        <button onClick={generateContent} disabled={generating || (mode === 'single' && !keyword)}
          style={{ padding: '12px 24px', background: generating ? '#ccc' : '#B85C38', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: generating ? 'default' : 'pointer' }}>
          {generating ? '🤖 Generating with Claude...' : '🚀 Generate Recipes'}
        </button>
      </div>

      {result && (
        <div style={{ background: result.success ? '#E8F5E9' : '#FFEBEE', borderRadius: 12, padding: 20, border: `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: result.success ? '#2E7D32' : '#C62828', marginBottom: 8 }}>
            {result.success ? `✅ Generated ${result.generated} recipe(s)` : `❌ Error: ${result.error}`}
          </h3>
          {result.results?.map((r, i) => (
            <div key={i} style={{ padding: '8px 0', fontSize: 14, borderTop: i > 0 ? '1px solid rgba(0,0,0,0.1)' : 'none' }}>
              <strong>{r.keyword}</strong>: {r.status} {r.slug && <span style={{ color: '#666' }}>→ /recipes/{r.slug}</span>}
            </div>
          ))}
          {result.duration_ms && <p style={{ fontSize: 12, color: '#888', marginTop: 8 }}>Completed in {(result.duration_ms / 1000).toFixed(1)}s</p>}
        </div>
      )}
    </div>
  );
}

// =============================================
// INGREDIENTS PAGE
// =============================================
function IngredientsPage() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name_en: '', name_jp: '', slug: '', category: '', description_en: '', description_jp: '', image_url: '', substitutes: [], where_to_buy: '' });
  const [subInput, setSubInput] = useState('');

  useEffect(() => { loadIngredients(); }, []);

  const loadIngredients = async () => {
    const { data } = await supabase.from('ingredients').select('*').order('name_en');
    setIngredients(data || []);
    setLoading(false);
  };

  const openEdit = (ing) => {
    setForm({
      name_en: ing.name_en || '', name_jp: ing.name_jp || '', slug: ing.slug || '',
      category: ing.category || '', description_en: ing.description_en || '',
      description_jp: ing.description_jp || '', image_url: ing.image_url || '',
      substitutes: ing.substitutes || [], where_to_buy: ing.where_to_buy || '',
    });
    setEditId(ing.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setForm({ name_en: '', name_jp: '', slug: '', category: '', description_en: '', description_jp: '', image_url: '', substitutes: [], where_to_buy: '' });
    setEditId(null);
    setShowForm(false);
  };

  const saveIngredient = async (e) => {
    e.preventDefault();
    const slug = form.slug || form.name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const toSave = { ...form, slug };

    if (editId) {
      await supabase.from('ingredients').update(toSave).eq('id', editId);
    } else {
      await supabase.from('ingredients').insert(toSave);
    }
    resetForm();
    loadIngredients();
  };

  const deleteIngredient = async (id) => {
    if (!confirm('Delete this ingredient?')) return;
    await supabase.from('recipe_ingredients').delete().eq('ingredient_id', id);
    await supabase.from('ingredients').delete().eq('id', id);
    loadIngredients();
  };

  const addSubstitute = () => {
    if (!subInput.trim()) return;
    setForm({ ...form, substitutes: [...form.substitutes, subInput.trim()] });
    setSubInput('');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Ingredients ({ingredients.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          style={{ padding: '10px 20px', background: '#4A7C59', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {showForm ? 'Cancel' : '+ Add Ingredient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={saveIngredient} style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #f0f0f0', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{editId ? 'Edit Ingredient' : 'New Ingredient'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>English Name *</label>
              <input value={form.name_en} onChange={e => setForm({ ...form, name_en: e.target.value })} required
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Japanese Name</label>
              <input value={form.name_jp} onChange={e => setForm({ ...form, name_jp: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
                <option value="">Select...</option>
                {['sauce', 'paste', 'broth', 'protein', 'vegetable', 'seaweed', 'dry-goods', 'spice', 'condiment', 'grain', 'noodle', 'other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Slug</label>
              <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })}
                placeholder="auto-generated" style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            </div>
          </div>

          {/* Image */}
          <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Image URL</label>
              <input value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
            </div>
            {form.image_url && (
              <img src={form.image_url} alt="" style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover' }} />
            )}
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Description (EN)</label>
            <textarea value={form.description_en} onChange={e => setForm({ ...form, description_en: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, minHeight: 80, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Description (JP)</label>
            <textarea value={form.description_jp} onChange={e => setForm({ ...form, description_jp: e.target.value })}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, minHeight: 60, resize: 'vertical' }} />
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Where to Buy</label>
            <input value={form.where_to_buy} onChange={e => setForm({ ...form, where_to_buy: e.target.value })}
              placeholder="Asian grocery stores, Amazon..." style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
          </div>

          {/* Substitutes */}
          <div style={{ marginTop: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4 }}>Substitutes</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={subInput} onChange={e => setSubInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubstitute())}
                placeholder="Add substitute..." style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
              <button type="button" onClick={addSubstitute} style={{ padding: '8px 16px', background: '#f0f0f0', border: 'none', borderRadius: 8, cursor: 'pointer' }}>+</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
              {form.substitutes.map((s, i) => (
                <span key={i} style={{ fontSize: 12, padding: '4px 10px', background: '#E8F5E9', color: '#2E7D32', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  {s}
                  <button type="button" onClick={() => setForm({ ...form, substitutes: form.substitutes.filter((_, j) => j !== i) })}
                    style={{ background: 'none', border: 'none', color: '#2E7D32', cursor: 'pointer', padding: 0, fontSize: 14 }}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <button type="submit" style={{ padding: '10px 24px', background: '#4A7C59', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              {editId ? 'Update' : 'Save'} Ingredient
            </button>
            {editId && <button type="button" onClick={resetForm} style={{ padding: '10px 24px', background: '#f0f0f0', color: '#555', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Cancel</button>}
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {ingredients.map(ing => (
          <div key={ing.id} style={{ background: 'white', borderRadius: 10, padding: 16, border: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'start' }}>
              {ing.image_url ? (
                <img src={ing.image_url} alt={ing.name_en} style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: 8, background: '#F5E6D3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🥢</div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600 }}>{ing.name_en}</p>
                {ing.name_jp && <p style={{ fontSize: 12, color: '#888' }}>{ing.name_jp}</p>}
                {ing.category && <span style={{ fontSize: 11, background: '#F5E6D3', color: '#A87B52', padding: '2px 8px', borderRadius: 4, marginTop: 4, display: 'inline-block' }}>{ing.category}</span>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 10, borderTop: '1px solid #f5f5f5', paddingTop: 10 }}>
              <button onClick={() => openEdit(ing)} style={{ padding: '4px 12px', fontSize: 12, background: '#F5E6D3', color: '#A87B52', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Edit</button>
              <a href={`/ingredients/${ing.slug}`} target="_blank" style={{ padding: '4px 12px', fontSize: 12, background: '#E3F2FD', color: '#1565C0', borderRadius: 4, textDecoration: 'none' }}>View</a>
              <button onClick={() => deleteIngredient(ing.id)} style={{ padding: '4px 12px', fontSize: 12, background: '#FFEBEE', color: '#C62828', border: 'none', borderRadius: 4, cursor: 'pointer', marginLeft: 'auto' }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// KEYWORDS PAGE
// =============================================
function KeywordsPage() {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  useEffect(() => { loadKeywords(); }, []);

  const loadKeywords = async () => {
    const { data } = await supabase.from('keywords_queue').select('*').order('priority', { ascending: false }).order('created_at', { ascending: false });
    setKeywords(data || []);
    setLoading(false);
  };

  const addKeyword = async (e) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;
    await supabase.from('keywords_queue').insert({ keyword: newKeyword.trim(), priority: 0 });
    setNewKeyword('');
    loadKeywords();
  };

  const addBulk = async () => {
    const kws = bulkInput.split('\n').map(k => k.trim()).filter(k => k);
    if (kws.length === 0) return;
    await supabase.from('keywords_queue').insert(kws.map((k, i) => ({ keyword: k, priority: kws.length - i })));
    setBulkInput('');
    setShowBulk(false);
    loadKeywords();
  };

  const deleteKeyword = async (id) => {
    await supabase.from('keywords_queue').delete().eq('id', id);
    loadKeywords();
  };

  const statusColor = (s) => {
    const map = { queued: '#E3F2FD', in_progress: '#FFF3E0', completed: '#E8F5E9', failed: '#FFEBEE', rejected: '#F5F5F5' };
    const textMap = { queued: '#1565C0', in_progress: '#E65100', completed: '#2E7D32', failed: '#C62828', rejected: '#888' };
    return { bg: map[s] || '#F5F5F5', color: textMap[s] || '#888' };
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Keyword Queue ({keywords.filter(k => k.status === 'queued').length} queued)</h1>
        <button onClick={() => setShowBulk(!showBulk)}
          style={{ padding: '10px 20px', background: '#3D5A80', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          {showBulk ? 'Cancel' : '📋 Bulk Add'}
        </button>
      </div>

      <form onSubmit={addKeyword} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Add keyword (e.g., yakitori recipe)"
          style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }} />
        <button type="submit" style={{ padding: '10px 20px', background: '#B85C38', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Add</button>
      </form>

      {showBulk && (
        <div style={{ background: 'white', borderRadius: 12, padding: 20, border: '1px solid #f0f0f0', marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Add multiple keywords (one per line):</p>
          <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)} rows={8} placeholder="yakitori recipe\nmiso soup recipe\nmatcha latte recipe\n..."
            style={{ width: '100%', padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
          <button onClick={addBulk} style={{ marginTop: 8, padding: '10px 24px', background: '#3D5A80', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Add {bulkInput.split('\n').filter(k => k.trim()).length} Keywords
          </button>
        </div>
      )}

      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
        {keywords.map(kw => (
          <div key={kw.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{kw.keyword}</span>
              {kw.source !== 'manual' && <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{kw.source}</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 12, background: statusColor(kw.status).bg, color: statusColor(kw.status).color }}>{kw.status}</span>
              {kw.status === 'queued' && <button onClick={() => deleteKeyword(kw.id)} style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer' }}>×</button>}
            </div>
          </div>
        ))}
        {keywords.length === 0 && <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>No keywords in queue. Add some to start generating content!</p>}
      </div>
    </div>
  );
}

// =============================================
// AUTOMATION PAGE
// =============================================
function AutomationPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('automation_log').select('*').order('created_at', { ascending: false }).limit(50);
      setLogs(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Automation Center</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>CONTENT GENERATION</p>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Daily at 07:00 UTC</p>
          <p style={{ fontSize: 12, color: '#666' }}>generate-content → Claude API</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>AUTO PUBLISHER</p>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Daily at 10:00 UTC</p>
          <p style={{ fontSize: 12, color: '#666' }}>auto-publisher → IndexNow</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 16, border: '1px solid #f0f0f0' }}>
          <p style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>IMAGE GENERATION</p>
          <p style={{ fontSize: 14, fontWeight: 500 }}>Daily at 07:30 UTC</p>
          <p style={{ fontSize: 12, color: '#666' }}>generate-image → Freepik API</p>
        </div>
      </div>

      <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Recent Logs</h2>
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #f0f0f0' }}>
        {logs.map(log => (
          <div key={log.id} style={{ padding: '12px 16px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{log.action_type}</span>
              <span style={{ fontSize: 12, color: '#888', marginLeft: 8 }}>{log.edge_function}</span>
              {log.duration_ms && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 8 }}>{(log.duration_ms / 1000).toFixed(1)}s</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 12,
                background: log.status === 'success' ? '#E8F5E9' : '#FFEBEE',
                color: log.status === 'success' ? '#2E7D32' : '#C62828' }}>{log.status}</span>
              <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(log.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {logs.length === 0 && <p style={{ padding: 40, textAlign: 'center', color: '#888' }}>No automation logs yet</p>}
      </div>
    </div>
  );
}

// =============================================
// SETTINGS PAGE
// =============================================
function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('site_settings').select('*');
      const s = {};
      data?.forEach(d => { s[d.key] = d.value; });
      setSettings(s);
      setLoading(false);
    }
    load();
  }, []);

  const updateSetting = async (key, value) => {
    await supabase.from('site_settings').update({ value }).eq('key', key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <p style={{ color: '#888', padding: 40 }}>Loading settings...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Settings</h1>
        {saved && <span style={{ fontSize: 13, color: '#2E7D32', background: '#E8F5E9', padding: '4px 12px', borderRadius: 6 }}>Saved!</span>}
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #f0f0f0', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Content Generation</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>Daily Batch Size</label>
            <input type="number" value={settings.content_generation?.daily_batch_size || 5}
              onChange={e => { const v = { ...settings.content_generation, daily_batch_size: Number(e.target.value) }; setSettings({ ...settings, content_generation: v }); updateSetting('content_generation', v); }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, marginTop: 4 }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#555' }}>Min Word Count</label>
            <input type="number" value={settings.content_generation?.min_word_count || 1500}
              onChange={e => { const v = { ...settings.content_generation, min_word_count: Number(e.target.value) }; setSettings({ ...settings, content_generation: v }); updateSetting('content_generation', v); }}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 6, fontSize: 14, marginTop: 4 }} />
          </div>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #f0f0f0', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>API Status</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {['claude', 'freepik', 'gsc', 'adsense'].map(api => (
            <div key={api} style={{ padding: 12, borderRadius: 8, background: '#f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{api}</span>
              <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4,
                background: settings.api_status?.[api] === 'configured' ? '#E8F5E9' : '#FFF3E0',
                color: settings.api_status?.[api] === 'configured' ? '#2E7D32' : '#E65100'
              }}>{settings.api_status?.[api] || 'not configured'}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 12, padding: 24, border: '1px solid #f0f0f0' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Deployment</h2>
        <p style={{ fontSize: 13, color: '#666' }}>GitHub Repo: <strong>Abdelhamidzain/za3tr</strong></p>
        <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Cloudflare Pages: <strong>za3tr.pages.dev</strong></p>
        <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Supabase: <strong>doswprgdalotithjdjkc (Tokyo)</strong></p>
      </div>
    </div>
  );
}

// =============================================
// MAIN ADMIN APP
// =============================================
export default function AdminApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFF8F0' }}>
        <p style={{ color: '#888', fontSize: 16 }}>Loading...</p>
      </div>
    );
  }

  if (!user) return <LoginPage onLogin={setUser} />;

  const renderPage = () => {
    // Handle recipe editor routes
    if (currentPage === 'recipe-new') {
      return <RecipeEditor onBack={() => setCurrentPage('recipes')} />;
    }
    if (currentPage.startsWith('recipe-edit:')) {
      const id = currentPage.split(':')[1];
      return <RecipeEditor recipeId={id} onBack={() => setCurrentPage('recipes')} />;
    }

    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'recipes': return <RecipesPage onNavigate={setCurrentPage} />;
      case 'ai-generator': return <AIGeneratorPage />;
      case 'ingredients': return <IngredientsPage />;
      case 'keywords': return <KeywordsPage />;
      case 'automation': return <AutomationPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} />
      <main style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        {renderPage()}
      </main>
    </div>
  );
}
