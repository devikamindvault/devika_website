import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseAnonKey ? 'Key loaded' : 'Key missing');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Contact form submission with better error handling
export const submitContactForm = async (formData) => {
  console.log('Submitting contact form:', formData);
  
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([formData])
      .select();
    
    console.log('Contact form response:', { data, error });
    return { data, error };
  } catch (err) {
    console.error('Contact form error:', err);
    return { data: null, error: err };
  }
};

// Test database connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('count')
      .limit(1);
    
    console.log('Database test:', { data, error });
    return !error;
  } catch (err) {
    console.error('Database connection test failed:', err);
    return false;
  }
};