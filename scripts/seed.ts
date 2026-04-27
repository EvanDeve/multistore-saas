import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase URL or Service Role Key in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

async function seed() {
  console.log('🌱 Starting database seed...')

  // 1. Create a dummy test store
  const { data: store, error: storeError } = await supabase
    .from('stores')
    .insert({
      slug: 'demo',
      name: 'Tienda Demo',
      description: 'Una tienda de prueba para el desarrollo multi-tenant.',
      primary_color: '#007bff',
      secondary_color: '#0062cc',
      accent_color: '#00c853',
      whatsapp_number: '50688888888',
      admin_email: 'demo@example.com', // Must match your test user in Auth
      is_active: true
    })
    .select()
    .single()

  if (storeError) {
    if (storeError.code === '23505') {
      console.log('⚠️ Store "demo" already exists. Continuing...')
    } else {
      console.error('❌ Error creating store:', storeError)
      process.exit(1)
    }
  }

  // Fetch the store ID in case it already existed
  const { data: existingStore } = await supabase
    .from('stores')
    .select('id')
    .eq('slug', 'demo')
    .single()

  const storeId = store?.id || existingStore?.id

  if (!storeId) {
    console.error('❌ Could not get store ID')
    process.exit(1)
  }

  console.log(`✅ Store ready: ID ${storeId}`)

  // 2. Create Categories
  const { data: catElectronics, error: catError1 } = await supabase
    .from('categories')
    .upsert({ store_id: storeId, name: 'Electrónica', slug: 'electronica', sort_order: 1 }, { onConflict: 'store_id, slug' })
    .select()
    .single()

  const { data: catRopa, error: catError2 } = await supabase
    .from('categories')
    .upsert({ store_id: storeId, name: 'Ropa', slug: 'ropa', sort_order: 2 }, { onConflict: 'store_id, slug' })
    .select()
    .single()

  if (catError1 || catError2) {
    console.error('❌ Error creating categories:', catError1 || catError2)
  } else {
    console.log('✅ Categories created')
  }

  // 3. Create Products
  const products = [
    {
      store_id: storeId,
      category_id: catElectronics?.id,
      name: 'Auriculares Inalámbricos',
      description: 'Auriculares con cancelación de ruido activa.',
      price: 25000,
      compare_price: 35000,
      is_available: true,
      is_featured: true,
      sort_order: 1
    },
    {
      store_id: storeId,
      category_id: catRopa?.id,
      name: 'Camiseta Básica de Algodón',
      description: 'Camiseta 100% algodón, cómoda y fresca.',
      price: 8500,
      is_available: true,
      is_featured: false,
      sort_order: 2
    }
  ]

  for (const p of products) {
    // Only insert if it doesn't match by name and store_id
    const { data: existing } = await supabase
      .from('products')
      .select('id')
      .eq('name', p.name)
      .eq('store_id', p.store_id)
      .single()

    if (!existing) {
      const { error } = await supabase.from('products').insert(p)
      if (error) console.error(`❌ Error inserting product ${p.name}:`, error)
    }
  }

  console.log('✅ Products seeded successfully')
  console.log('🎉 Seed complete!')
}

seed()
