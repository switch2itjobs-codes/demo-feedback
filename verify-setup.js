#!/usr/bin/env node

/**
 * Quick verification script to test Supabase connection
 * Run: node verify-setup.js
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bwuydoljkgiawackigzj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dXlkb2xqa2dpYXdhY2tpZ3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTcxOTQzNiwiZXhwIjoyMDc3Mjk1NDM2fQ.WVNTM9uR7KJy_w6-opLN7i8bjaznXEe0j7JfKQ7sfJE';

console.log('🔍 Verifying Supabase Connection...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  try {
    // Test 1: Check connection
    console.log('1️⃣ Testing Supabase connection...');
    const { data, error, count } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }

    console.log('✅ Connection successful!\n');

    // Test 2: Count testimonials
    console.log('2️⃣ Counting testimonials...');
    const { count: totalCount, error: countError } = await supabase
      .from('testimonials')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Count failed:', countError.message);
      return false;
    }

    console.log(`✅ Total testimonials in database: ${totalCount}\n`);

    // Test 3: Check latest testimonials
    console.log('3️⃣ Fetching latest testimonials (sorted by date)...');
    const { data: testimonials, error: fetchError } = await supabase
      .from('testimonials')
      .select('id, date, review_type, review, rating, name, created_at')
      .eq('published', true)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError.message);
      return false;
    }

    console.log(`✅ Successfully fetched ${testimonials.length} latest testimonials\n`);

    if (testimonials.length > 0) {
      console.log('📋 Sample testimonial:');
      const latest = testimonials[0];
      console.log(`   - Date: ${latest.date || latest.created_at?.split('T')[0]}`);
      console.log(`   - Type: ${latest.review_type}`);
      console.log(`   - Rating: ${latest.rating}/5`);
      console.log(`   - Name: ${latest.name}`);
      console.log(`   - Review: ${latest.review?.substring(0, 50)}...\n`);
    }

    console.log('✅ All tests passed! Supabase is configured correctly.\n');
    console.log('📝 Next steps:');
    console.log('   1. Restart Cursor IDE for MCP to initialize');
    console.log('   2. Deploy to Vercel with environment variables');
    console.log('   3. Test the deployed application\n');

    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

verify().then(success => {
  process.exit(success ? 0 : 1);
});


