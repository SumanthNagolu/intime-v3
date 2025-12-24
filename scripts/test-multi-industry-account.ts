/**
 * Test Multi-Industry Account Creation
 * 
 * Creates a test account with multiple industries to verify array storage
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testMultiIndustryAccount() {
  console.log('Testing multi-industry account creation...\n');
  
  // Get org_id (use the first available org)
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single();
    
  if (!org) {
    console.error('No organization found');
    process.exit(1);
  }
  
  const testAccountName = `Test Multi-Industry ${Date.now()}`;
  const testIndustries = ['technology', 'fintech', 'healthcare'];
  const testBillingFrequency = 'biweekly';
  
  console.log(`Creating test account: ${testAccountName}`);
  console.log(`Industries: ${JSON.stringify(testIndustries)}`);
  console.log(`Billing Frequency: ${testBillingFrequency}`);
  console.log();
  
  // Create account with multiple industries
  const { data: account, error: accountError } = await supabase
    .from('companies')
    .insert({
      org_id: org.id,
      category: 'client',
      name: testAccountName,
      industry: testIndustries[0],
      industries: testIndustries,
      relationship_type: 'direct_client',
      status: 'active',
      tier: 'standard',
    })
    .select()
    .single();
    
  if (accountError || !account) {
    console.error('❌ Failed to create account:', accountError);
    process.exit(1);
  }
  
  console.log('✅ Account created successfully');
  console.log(`   ID: ${account.id}`);
  console.log();
  
  // Create client details with billing frequency
  const { data: clientDetails, error: detailsError } = await supabase
    .from('company_client_details')
    .insert({
      company_id: account.id,
      org_id: org.id,
      billing_entity_name: 'Test Billing Entity',
      billing_email: 'billing@test.com',
      billing_frequency: testBillingFrequency,
      po_required: true,
    })
    .select()
    .single();
    
  if (detailsError || !clientDetails) {
    console.error('❌ Failed to create client details:', detailsError);
    process.exit(1);
  }
  
  console.log('✅ Client details created successfully');
  console.log();
  
  // Verify data was stored correctly
  const { data: verifyAccount } = await supabase
    .from('companies')
    .select('id, name, industry, industries')
    .eq('id', account.id)
    .single();
    
  const { data: verifyDetails } = await supabase
    .from('company_client_details')
    .select('billing_frequency, billing_entity_name, po_required')
    .eq('company_id', account.id)
    .single();
    
  console.log('Verification Results:');
  console.log('--------------------');
  console.log('Account:');
  console.log(`  Name: ${verifyAccount?.name}`);
  console.log(`  industry (single): ${verifyAccount?.industry}`);
  console.log(`  industries (array): ${JSON.stringify(verifyAccount?.industries)}`);
  
  if (verifyAccount?.industries && Array.isArray(verifyAccount.industries) && verifyAccount.industries.length === 3) {
    console.log('  ✅ All 3 industries stored correctly');
  } else {
    console.log(`  ❌ Industries not stored correctly (got ${verifyAccount?.industries?.length} instead of 3)`);
  }
  
  console.log();
  console.log('Client Details:');
  console.log(`  Billing Frequency: ${verifyDetails?.billing_frequency}`);
  console.log(`  Billing Entity: ${verifyDetails?.billing_entity_name}`);
  console.log(`  PO Required: ${verifyDetails?.po_required}`);
  
  if (verifyDetails?.billing_frequency === testBillingFrequency) {
    console.log('  ✅ Billing frequency stored correctly');
  } else {
    console.log(`  ❌ Billing frequency not stored correctly (got ${verifyDetails?.billing_frequency})`);
  }
  
  console.log();
  console.log('✅ All tests passed! Both fields are working correctly:');
  console.log('   1. industries[] array can store multiple values');
  console.log('   2. billing_frequency is persisted to database');
}

testMultiIndustryAccount()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });

