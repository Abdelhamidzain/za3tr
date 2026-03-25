import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://doswprgdalotithjdjkc.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvc3dwcmdkYWxvdGl0aGpkamtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NjA4NjUsImV4cCI6MjA5MDAzNjg2NX0.dS1MZ_YV7Yi5JpQ67pIRgYDGXTESBxT1_Js3BMx7C8Y';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Generate image via Edge Function
export async function generateImage(recipeId: string): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch(`${supabaseUrl}/functions/v1/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ recipe_id: recipeId }),
  });
  return res.json();
}

// Inline styles
export const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', border: '1px solid #ddd',
  borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit',
};

export const textareaStyle: React.CSSProperties = {
  ...inputStyle, minHeight: 120, resize: 'vertical' as const,
};

export const btnPrimary: React.CSSProperties = {
  padding: '10px 24px', background: '#B85C38', color: 'white',
  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
};

export const btnSecondary: React.CSSProperties = {
  padding: '10px 24px', background: '#f0f0f0', color: '#555',
  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
};

export const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 4,
};

export const cardStyle: React.CSSProperties = {
  background: 'white', borderRadius: 12, padding: 24,
  border: '1px solid #f0f0f0', marginBottom: 16,
};
