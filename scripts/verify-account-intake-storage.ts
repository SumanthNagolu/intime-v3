/**
 * Verify Account Intake Fields Storage
 * 
 * Checks that all form fields from the account intake are properly stored:
 * 1. industries[] array in companies table
 * 2. billing_frequency in company_client_details table
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

async function verifyAccountIntakeStorage() {
  console.log('Verifying account intake field storage...\n');
  
  // Get the most recent account (created via the test account creation)
  const { data: recentAccount, error: accountError } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      industry,
      industries,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
    
  if (accountError || !recentAccount) {
    console.error('❌ Error fetching recent account:', accountError);
    process.exit(1);
  }
  
  console.log('Most Recent Account:');
  console.log('-------------------');
  console.log(`ID: ${recentAccount.id}`);
  console.log(`Name: ${recentAccount.name}`);
  console.log(`Created: ${recentAccount.created_at}`);
  console.log();
  
  // Check industries field
  console.log('Industry Fields:');
  console.log('  industry (single):  ', recentAccount.industry || '(null)');
  console.log('  industries (array): ', recentAccount.industries ? JSON.stringify(recentAccount.industries) : '(null)');
  
  if (recentAccount.industries && Array.isArray(recentAccount.industries)) {
    console.log('  ✅ industries array is stored');
    console.log(`  ✅ Contains ${recentAccount.industries.length} value(s)`);
  } else {
    console.log('  ⚠️  industries array is NULL or not an array');
  }
  console.log();
  
  // Check if there are client details for this account
  const { data: clientDetails, error: detailsError } = await supabase
    .from('company_client_details')
    .select('*')
    .eq('company_id', recentAccount.id)
    .maybeSingle();
    
  if (detailsError) {
    console.error('❌ Error fetching client details:', detailsError);
  } else if (!clientDetails) {
    console.log('Client Details: No billing/client details found for this account');
    console.log('  (This is normal if billing info was not entered in the form)');
  } else {
    console.log('Client Details Found:');
    console.log('--------------------');
    console.log(`  Billing Entity: ${clientDetails.billing_entity_name || '(null)'}`);
    console.log(`  Billing Email:  ${clientDetails.billing_email || '(null)'}`);
    console.log(`  Billing Phone:  ${clientDetails.billing_phone || '(null)'}`);
    console.log(`  Billing Frequency: ${clientDetails.billing_frequency || '(null)'}`);
    console.log(`  PO Required: ${clientDetails.po_required || false}`);
    
    if (clientDetails.billing_frequency) {
      console.log('  ✅ billing_frequency is stored');
    } else {
      console.log('  ⚠️  billing_frequency is NULL');
    }
  }
  console.log();
  
  // Get a summary of all accounts with industries
  const { data: accountsWithIndustries, error: summaryError } = await supabase
    .from('companies')
    .select('id, name, industries')
    .not('industries', 'is', null)
    .order('created_at', { ascending: false })
    .limit(5);
    
  if (!summaryError && accountsWithIndustries && accountsWithIndustries.length > 0) {
    console.log(`\nRecent Accounts with Industries Array (${accountsWithIndustries.length}):`);
    console.log('----------------------------------------');
    accountsWithIndustries.forEach((acct, idx) => {
      console.log(`${idx + 1}. ${acct.name}`);
      console.log(`   industries: ${JSON.stringify(acct.industries)}`);
    });
  }
  
  console.log('\n✅ Verification complete!');
}

verifyAccountIntakeStorage()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });

