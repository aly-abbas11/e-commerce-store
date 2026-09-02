const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
let url = '', key = '';
for (const line of envFile.split(/\r?\n/)) {
  const t = line.trim();
  if (t.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = t.split('=')[1].trim().replace(/^["']|["']$/g, '');
  if (t.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = t.split('=')[1].trim().replace(/^["']|["']$/g, '');
  if (!key && t.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = t.split('=')[1].trim().replace(/^["']|["']$/g, '');
}

async function check() {
  const res = await fetch(`${url}/rest/v1/products?select=id,name,slug,category,is_demo,status,created_at`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  console.log('PRODUCTS_FOUND:', data.length);
  if (Array.isArray(data)) {
    data.forEach(p => console.log(`- [${p.id}] ${p.name} (${p.slug}) | category: ${p.category} | demo: ${p.is_demo}`));
  } else {
    console.log(data);
  }
}
check().catch(console.error);
