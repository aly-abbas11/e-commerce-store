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
  const { data: prods } = await supabase.from('products').select('id, name, badge, category');
  console.log('Total products:', prods?.length);
  const badges = new Set(prods?.map(p => p.badge).filter(Boolean));
  console.log('Unique badges:', Array.from(badges));
  const categories = new Set(prods?.map(p => p.category).filter(Boolean));
  console.log('Unique categories:', Array.from(categories));
  
  const typoBadges = prods?.filter(p => p.badge?.includes('Feature') || p.badge?.includes('dd'));
  console.log('Typo badges:', typoBadges);
}

main();
