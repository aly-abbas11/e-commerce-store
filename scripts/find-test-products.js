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

async function run() {
  const res = await fetch(`${url}/rest/v1/products?select=id,name,slug,category,is_demo,status,created_at`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  if (!Array.isArray(data)) {
    console.error(data);
    return;
  }
  const testItems = data.filter(p => {
    const name = (p.name || '').toLowerCase();
    const slug = (p.slug || '').toLowerCase();
    return name.includes('test') || name.includes('demo') || name.includes('sample') || slug.includes('test') || slug.includes('demo') || p.is_demo === true;
  });

  console.log(`Found ${testItems.length} test/demo items out of ${data.length} total products:`);
  testItems.forEach(p => console.log(`- [${p.id}] ${p.name} (${p.slug})`));
}

run().catch(err => console.error(err));
