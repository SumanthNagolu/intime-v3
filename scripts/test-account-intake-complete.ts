/**
 * Complete Account Intake Test
 * 
 * Creates a test account with ALL fields populated to verify storage
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

async function testAccountIntake() {
  console.log('🧪 Testing Complete Account Intake...\n');
  
  // Get org_id
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .limit(1)
    .single();
    
  if (!org) {
    console.error('No organization found');
    process.exit(1);
  }
  
  const testName = `Complete Test ${Date.now()}`;
  
  // Test data matching what the form sends
  const testData = {
    name: testName,
    industry: 'technology',
    industries: ['technology', 'fintech', 'healthcare', 'finance'],
    companyType: 'direct_client',
    tier: 'preferred',
    website: 'https://test-company.com',
    phone: '+1 (555) 123-4567',
    // HQ Location - separate fields
    headquartersCity: 'Toronto',
    headquartersState: 'Ontario',
    headquartersCountry: 'CA',
    description: 'Test company description',
    linkedinUrl: 'https://linkedin.com/company/test',
    // Billing
    billingEntityName: 'Test Billing LLC',
    billingEmail: 'billing@test.com',
    billingPhone: '+1 (555) 987-6543',
    billingAddress: '123 Billing St',
    billingCity: 'New York',
    billingState: 'NY',
    billingPostalCode: '10001',
    billingCountry: 'US',
    billingFrequency: 'biweekly',
    paymentTermsDays: 45,
    poRequired: true,
    // Communication
    preferredContactMethod: 'email',
    meetingCadence: 'weekly',
    // Contact
    primaryContactName: 'John Doe',
    primaryContactEmail: 'john@test.com',
    primaryContactTitle: 'VP Engineering',
    primaryContactPhone: '+1 (555) 111-2222',
  };

  console.log('Creating account with test data...');
  console.log(`  Industries: ${JSON.stringify(testData.industries)}`);
  console.log(`  HQ: ${testData.headquartersCity}, ${testData.headquartersState}, ${testData.headquartersCountry}`);
  console.log(`  Billing Frequency: ${testData.billingFrequency}`);
  console.log(`  Contact: ${testData.primaryContactName} (${testData.primaryContactEmail})`);
  console.log();

  // Create company
  const { data: account, error: accountError } = await supabase
    .from('companies')
    .insert({
      org_id: org.id,
      category: 'client',
      name: testData.name,
      industry: testData.industry,
      industries: testData.industries,
      relationship_type: 'direct_client',
      status: 'active',
      tier: 'preferred',
      website: testData.website,
      phone: testData.phone,
      headquarters_city: testData.headquartersCity,
      headquarters_state: testData.headquartersState,
      headquarters_country: testData.headquartersCountry,
      description: testData.description,
      linkedin_url: testData.linkedinUrl,
      preferred_contact_method: testData.preferredContactMethod,
      meeting_cadence: testData.meetingCadence,
      default_payment_terms: `Net ${testData.paymentTermsDays}`,
      requires_po: testData.poRequired,
    })
    .select()
    .single();
    
  if (accountError) {
    console.error('❌ Failed to create account:', accountError.message);
    process.exit(1);
  }
  
  console.log('✅ Account created: ' + account.id);
  
  // Create client details (always)
  const { error: clientDetailsError } = await supabase
    .from('company_client_details')
    .insert({
      company_id: account.id,
      org_id: org.id,
      billing_entity_name: testData.billingEntityName,
      billing_email: testData.billingEmail,
      billing_phone: testData.billingPhone,
      billing_frequency: testData.billingFrequency,
      po_required: testData.poRequired,
      billing_address_line_1: testData.billingAddress,
      billing_city: testData.billingCity,
      billing_state: testData.billingState,
      billing_postal_code: testData.billingPostalCode,
      billing_country: testData.billingCountry,
    });
    
  if (clientDetailsError) {
    console.error('❌ Failed to create client details:', clientDetailsError.message);
  } else {
    console.log('✅ Client details created');
  }
  
  // Create address
  const { error: addressError } = await supabase
    .from('addresses')
    .insert({
      org_id: org.id,
      entity_type: 'account',
      entity_id: account.id,
      address_type: 'headquarters',
      city: testData.headquartersCity,
      state_province: testData.headquartersState,
      country_code: testData.headquartersCountry,
      is_primary: true,
    });
    
  if (addressError) {
    console.error('❌ Failed to create address:', addressError.message);
  } else {
    console.log('✅ Address created');
  }
  
  // Create contact (with name OR email)
  const nameParts = testData.primaryContactName.split(' ');
  const { error: contactError } = await supabase
    .from('contacts')
    .insert({
      org_id: org.id,
      company_id: account.id,
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' '),
      email: testData.primaryContactEmail,
      phone: testData.primaryContactPhone,
      title: testData.primaryContactTitle,
      subtype: 'client_poc',
      is_primary: true,
    });
    
  if (contactError) {
    console.error('❌ Failed to create contact:', contactError.message);
  } else {
    console.log('✅ Contact created');
  }
  
  console.log('\n=== VERIFICATION ===\n');
  
  // Verify company
  const { data: verifyAccount } = await supabase
    .from('companies')
    .select('*')
    .eq('id', account.id)
    .single();
    
  console.log('Company Record:');
  console.log(`  Name: ${verifyAccount?.name}`);
  console.log(`  industry (single): ${verifyAccount?.industry}`);
  console.log(`  industries (array): ${JSON.stringify(verifyAccount?.industries)}`);
  console.log(`  headquarters_city: ${verifyAccount?.headquarters_city}`);
  console.log(`  headquarters_state: ${verifyAccount?.headquarters_state}`);
  console.log(`  headquarters_country: ${verifyAccount?.headquarters_country}`);
  console.log(`  meeting_cadence: ${verifyAccount?.meeting_cadence}`);
  
  // Check industries
  if (verifyAccount?.industries?.length === 4) {
    console.log('  ✅ All 4 industries stored correctly');
  } else {
    console.log(`  ❌ Industries issue - expected 4, got ${verifyAccount?.industries?.length || 0}`);
  }
  
  // Check HQ location
  if (verifyAccount?.headquarters_city === 'Toronto' && verifyAccount?.headquarters_state === 'Ontario') {
    console.log('  ✅ HQ City/State stored correctly');
  } else {
    console.log(`  ❌ HQ location issue - city=${verifyAccount?.headquarters_city}, state=${verifyAccount?.headquarters_state}`);
  }
  
  // Verify client details
  const { data: verifyDetails } = await supabase
    .from('company_client_details')
    .select('*')
    .eq('company_id', account.id)
    .single();
    
  console.log('\nClient Details:');
  console.log(`  billing_entity_name: ${verifyDetails?.billing_entity_name}`);
  console.log(`  billing_frequency: ${verifyDetails?.billing_frequency}`);
  console.log(`  billing_city: ${verifyDetails?.billing_city}`);
  console.log(`  po_required: ${verifyDetails?.po_required}`);
  
  if (verifyDetails?.billing_frequency === 'biweekly') {
    console.log('  ✅ Billing frequency stored correctly');
  } else {
    console.log(`  ❌ Billing frequency issue - got ${verifyDetails?.billing_frequency}`);
  }
  
  // Verify address
  const { data: verifyAddress } = await supabase
    .from('addresses')
    .select('*')
    .eq('entity_id', account.id)
    .eq('address_type', 'headquarters')
    .single();
    
  console.log('\nAddress:');
  console.log(`  city: ${verifyAddress?.city}`);
  console.log(`  state_province: ${verifyAddress?.state_province}`);
  console.log(`  country_code: ${verifyAddress?.country_code}`);
  
  if (verifyAddress?.city === 'Toronto' && verifyAddress?.state_province === 'Ontario') {
    console.log('  ✅ Address stored correctly');
  } else {
    console.log(`  ❌ Address issue`);
  }
  
  // Verify contact
  const { data: verifyContact } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', account.id)
    .eq('is_primary', true)
    .single();
    
  console.log('\nContact:');
  console.log(`  first_name: ${verifyContact?.first_name}`);
  console.log(`  last_name: ${verifyContact?.last_name}`);
  console.log(`  email: ${verifyContact?.email}`);
  console.log(`  phone: ${verifyContact?.phone}`);
  console.log(`  title: ${verifyContact?.title}`);
  
  if (verifyContact?.first_name === 'John' && verifyContact?.email === 'john@test.com') {
    console.log('  ✅ Contact stored correctly');
  } else {
    console.log(`  ❌ Contact issue`);
  }
  
  console.log('\n🎉 Test complete!');
}

testAccountIntake()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });

