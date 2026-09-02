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
  // First query any product matching test or demo
  const res = await fetch(`${url}/rest/v1/products?select=id,name,slug`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` }
  });
  const data = await res.json();
  const testItems = data.filter(p => {
    const name = (p.name || '').toLowerCase();
    const slug = (p.slug || '').toLowerCase();
    return name.includes('test') || name.includes('demo') || name.includes('sample') || slug.includes('test') || slug.includes('demo');
  });

  for (const p of testItems) {
    console.log(`Deleting product_images for product_id: ${p.id}...`);
    await fetch(`${url}/rest/v1/product_images?product_id=eq.${p.id}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });

    console.log(`Deleting product variants for product_id: ${p.id}...`);
    await fetch(`${url}/rest/v1/product_variants?product_id=eq.${p.id}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });

    console.log(`Deleting product reviews for product_id: ${p.id}...`);
    await fetch(`${url}/rest/v1/product_reviews?product_id=eq.${p.id}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });

    console.log(`Deleting product: [${p.id}] ${p.name} (${p.slug})...`);
    const delRes = await fetch(`${url}/rest/v1/products?id=eq.${p.id}`, {
      method: 'DELETE',
      headers: { apikey: key, Authorization: `Bearer ${key}` }
    });
    console.log(`Product ${p.name} deleted successfully status:`, delRes.status);
  }
}

run().catch(console.error);
