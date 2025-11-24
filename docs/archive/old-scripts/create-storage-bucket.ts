#!/usr/bin/env tsx

/**
 * Create Supabase Storage Bucket for Employee Screenshots
 *
 * This script creates the employee-screenshots bucket with proper configuration.
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing environment variables');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SERVICE_ROLE_KEY ? '✅' : '❌');
  process.exit(1);
}

async function createStorageBucket() {
  console.log('📦 Creating Supabase Storage Bucket\n');
  console.log(`📍 Supabase URL: ${SUPABASE_URL}\n`);

  const bucketConfig = {
    id: 'employee-screenshots',
    name: 'employee-screenshots',
    public: false, // Private bucket
    file_size_limit: 5242880, // 5 MB
    allowed_mime_types: ['image/png', 'image/jpeg', 'image/jpg']
  };

  try {
    console.log('⚙️  Creating bucket:', bucketConfig.id);
    console.log('   Public:', bucketConfig.public);
    console.log('   Max file size:', bucketConfig.file_size_limit / 1024 / 1024, 'MB');
    console.log('   Allowed types:', bucketConfig.allowed_mime_types.join(', '), '\n');

    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY
      },
      body: JSON.stringify(bucketConfig)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Bucket created successfully!\n');
      console.log('Bucket details:');
      console.log('   Name:', result.name);
      console.log('   Public:', result.public);
      console.log('   Created:', new Date(result.created_at).toLocaleString(), '\n');
    } else if (result.error === 'Duplicate') {
      console.log('⚠️  Bucket already exists\n');
      console.log('Verifying bucket configuration...\n');

      // Get bucket details
      const getResponse = await fetch(`${SUPABASE_URL}/storage/v1/bucket/employee-screenshots`, {
        headers: {
          'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
          'apikey': SERVICE_ROLE_KEY
        }
      });

      const bucketDetails = await getResponse.json();

      if (getResponse.ok) {
        console.log('✅ Bucket exists with configuration:');
        console.log('   Name:', bucketDetails.name);
        console.log('   Public:', bucketDetails.public);
        console.log('   Created:', new Date(bucketDetails.created_at).toLocaleString(), '\n');
      }
    } else {
      console.error('❌ Failed to create bucket:', result.error || result.message);
      process.exit(1);
    }

    // Note: Storage policies must be created via SQL or Supabase Dashboard
    console.log('📋 Next steps:');
    console.log('   1. Verify bucket in Supabase Dashboard > Storage');
    console.log('   2. Storage RLS policies are managed via database migration');
    console.log('   3. Lifecycle policy (90-day retention) should be set in dashboard\n');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run
createStorageBucket().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
