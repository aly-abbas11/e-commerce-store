import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envText = fs.readFileSync('.env.local', 'utf8');
let url = '';
let key = '';
for (const line of envText.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    url = line.split('=')[1].trim().replace(/['"]/g, '');
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    key = line.split('=')[1].trim().replace(/['"]/g, '');
  }
}

const supabase = createClient(url, key);

async function main() {
  const { data: cats, error: catErr } = await supabase.from('categories').select('*');
  console.log('Categories:', cats, catErr);

  const { data: sections, error: secErr } = await supabase.from('home_sections').select('*');
  console.log('Home sections:', sections, secErr);
}

main();
