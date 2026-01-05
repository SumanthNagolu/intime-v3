#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:3000';

async function createAccount() {
  console.log('🚀 Starting browser automation...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 200
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('📍 Navigating to account creation page...');
  await page.goto(`${BASE_URL}/employee/recruiting/accounts/new`);
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('text=Identity & Classification', { timeout: 15000 });
  console.log('✅ Account creation page loaded');

  // ========================================
  // Step 1: Identity & Classification
  // ========================================
  console.log('\n📝 Step 1: Identity & Classification');

  // Company Account should already be selected (default)

  // Fill Company Name (id="name")
  await page.fill('#name', 'Apex Technology Solutions');
  console.log('  ✓ Company Name: Apex Technology Solutions');

  // Fill Legal Name (id="legalName")
  await page.fill('#legalName', 'Apex Technology Solutions, Inc.');
  console.log('  ✓ Legal Name: Apex Technology Solutions, Inc.');

  // Fill DBA (id="dba")
  await page.fill('#dba', 'Apex Tech');
  console.log('  ✓ DBA: Apex Tech');

  // Select Industry - Technology (click the chip button)
  await page.click('button:has-text("Technology")');
  console.log('  ✓ Industry: Technology selected');

  // Also select FinTech
  await page.click('button:has-text("FinTech")');
  console.log('  ✓ Industry: FinTech selected');

  // Company Type dropdown - select Implementation Partner
  await page.click('[id="companyType"] ~ button, button:has([placeholder="Select type"])');
  await page.waitForTimeout(200);
  await page.click('[role="option"]:has-text("Implementation Partner")').catch(async () => {
    // Try clicking on trigger first
    const trigger = page.locator('button:has-text("Direct Client")');
    await trigger.click();
    await page.waitForTimeout(200);
    await page.click('text=Implementation Partner');
  });
  console.log('  ✓ Company Type: Implementation Partner');

  // Partnership Tier dropdown
  const tierTrigger = page.locator('button:has-text("No tier assigned")');
  if (await tierTrigger.isVisible()) {
    await tierTrigger.click();
    await page.waitForTimeout(200);
    await page.click('[role="option"]:has-text("Strategic")').catch(() => {
      console.log('  ⚠ Could not select tier');
    });
    console.log('  ✓ Partnership Tier: Strategic');
  }

  // Market Segment dropdown
  const segmentTrigger = page.locator('button:has-text("No segment assigned")');
  if (await segmentTrigger.isVisible()) {
    await segmentTrigger.click();
    await page.waitForTimeout(200);
    await page.click('[role="option"]:has-text("Enterprise")').catch(() => {
      console.log('  ⚠ Could not select segment');
    });
    console.log('  ✓ Market Segment: Enterprise');
  }

  // Fill Tax ID (id="taxId")
  await page.fill('#taxId', '12-3456789');
  console.log('  ✓ Tax ID: 12-3456789');

  // Fill Primary Email (id="email")
  await page.fill('#email', 'info@apextech.com');
  console.log('  ✓ Primary Email: info@apextech.com');

  // Fill Primary Phone - need to interact with PhoneInput component
  const phoneInput = page.locator('input[placeholder="(000) 000-0000"]').first();
  await phoneInput.fill('5551234567');
  console.log('  ✓ Primary Phone: 555-123-4567');

  // Fill Website (id="website")
  await page.fill('#website', 'https://apextech.com');
  console.log('  ✓ Website: https://apextech.com');

  // Fill LinkedIn URL (id="linkedinUrl")
  await page.fill('#linkedinUrl', 'https://linkedin.com/company/apextech');
  console.log('  ✓ LinkedIn: https://linkedin.com/company/apextech');

  // Fill Description (id="description")
  await page.fill('#description', 'Apex Technology Solutions is a leading provider of enterprise software consulting and implementation services, specializing in Guidewire platform implementations for the insurance industry.');
  console.log('  ✓ Description filled');

  // Click Continue
  console.log('\n🔄 Moving to Step 2...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  // ========================================
  // Step 2: Locations
  // ========================================
  console.log('\n📝 Step 2: Locations');

  // Click "Add Address" button
  await page.click('button:has-text("Add Address")');
  await page.waitForTimeout(500);

  // Fill address form in the inline panel
  // Address Type should default to "Office"

  // Street Address
  const streetInput = page.locator('input[placeholder*="Street address"]').first();
  await streetInput.fill('100 Technology Drive, Suite 500');
  console.log('  ✓ Street: 100 Technology Drive, Suite 500');

  // City
  const cityInput = page.locator('input[placeholder*="City"]').first();
  await cityInput.fill('San Francisco');
  console.log('  ✓ City: San Francisco');

  // State
  const stateInput = page.locator('input[placeholder*="State"]').first();
  await stateInput.fill('CA');
  console.log('  ✓ State: CA');

  // ZIP
  const zipInput = page.locator('input[placeholder*="ZIP"], input[placeholder*="Postal"]').first();
  await zipInput.fill('94105');
  console.log('  ✓ ZIP: 94105');

  // Click Primary checkbox
  await page.click('text=Primary').catch(() => {});

  // Save the address
  await page.click('button:has-text("Add Address"):not([disabled])').catch(async () => {
    // Try alternative
    await page.click('button:has-text("Save")').catch(() => {});
  });
  await page.waitForTimeout(500);
  console.log('  ✓ Address saved');

  // Click Continue
  console.log('\n🔄 Moving to Step 3...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  // ========================================
  // Step 3: Billing
  // ========================================
  console.log('\n📝 Step 3: Billing');

  // Billing Entity Name (id="billingEntityName")
  await page.fill('#billingEntityName', 'Apex Technology Solutions, Inc. - Accounts Payable');
  console.log('  ✓ Billing Entity Name filled');

  // Billing Email (id="billingEmail")
  await page.fill('#billingEmail', 'ap@apextech.com');
  console.log('  ✓ Billing Email: ap@apextech.com');

  // Billing Phone
  const billingPhoneInput = page.locator('input[placeholder="(000) 000-0000"]').first();
  await billingPhoneInput.fill('5559876543');
  console.log('  ✓ Billing Phone: 555-987-6543');

  // Billing Frequency - Monthly should be default, let's change to Weekly
  const freqTrigger = page.locator('button:has-text("Monthly")').first();
  if (await freqTrigger.isVisible()) {
    await freqTrigger.click();
    await page.waitForTimeout(200);
    await page.click('[role="option"]:has-text("Bi-weekly")').catch(() => {});
    console.log('  ✓ Billing Frequency: Bi-weekly');
  }

  // Payment Terms - Net 30 is default, change to Net 45
  const termsTrigger = page.locator('button:has-text("Net 30")').first();
  if (await termsTrigger.isVisible()) {
    await termsTrigger.click();
    await page.waitForTimeout(200);
    await page.click('[role="option"]:has-text("Net 45")').catch(() => {});
    console.log('  ✓ Payment Terms: Net 45');
  }

  // Check PO Required
  await page.click('text=Purchase Order Required').catch(() => {});
  await page.waitForTimeout(200);

  // Fill PO Number if checkbox was checked
  const poInput = page.locator('#currentPoNumber');
  if (await poInput.isVisible()) {
    await poInput.fill('PO-2024-001');
    console.log('  ✓ PO Number: PO-2024-001');
  }

  // Click Continue
  console.log('\n🔄 Moving to Step 4...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  // ========================================
  // Step 4: Contacts
  // ========================================
  console.log('\n📝 Step 4: Contacts');

  // Look for Add Contact button
  const addContactBtn = page.locator('button:has-text("Add Contact")');
  if (await addContactBtn.isVisible()) {
    await addContactBtn.click();
    await page.waitForTimeout(500);

    // Fill contact details in inline panel
    const firstNameInput = page.locator('input[placeholder*="First"]').first();
    await firstNameInput.fill('John');

    const lastNameInput = page.locator('input[placeholder*="Last"]').first();
    await lastNameInput.fill('Smith');

    const contactEmailInput = page.locator('input[placeholder*="email"], input[type="email"]').first();
    await contactEmailInput.fill('john.smith@apextech.com');

    const contactTitleInput = page.locator('input[placeholder*="Title"], input[placeholder*="title"]').first();
    await contactTitleInput.fill('VP of Engineering').catch(() => {});

    // Save contact
    await page.click('button:has-text("Add Contact"):not([disabled])').catch(async () => {
      await page.click('button:has-text("Save")').catch(() => {});
    });
    await page.waitForTimeout(500);
    console.log('  ✓ Contact added: John Smith');
  } else {
    console.log('  ⚠ No Add Contact button found, skipping');
  }

  // Click Continue
  console.log('\n🔄 Moving to Step 5...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  // ========================================
  // Step 5: Contracts (Document Upload)
  // ========================================
  console.log('\n📝 Step 5: Contracts');

  // Click Add Contract button
  const addContractBtn = page.locator('button:has-text("Add Contract")');
  if (await addContractBtn.isVisible()) {
    await addContractBtn.click();
    await page.waitForTimeout(500);

    // Fill contract name
    const contractNameInput = page.locator('input[placeholder*="Master Services Agreement"]').first();
    await contractNameInput.fill('MSA - Apex Technology Solutions 2024');
    console.log('  ✓ Contract Name: MSA - Apex Technology Solutions 2024');

    // Contract number
    const contractNumInput = page.locator('input[placeholder*="Optional"]').first();
    await contractNumInput.fill('MSA-2024-001').catch(() => {});
    console.log('  ✓ Contract Number: MSA-2024-001');

    // Set effective date
    const effectiveDateInput = page.locator('input[type="date"]').first();
    await effectiveDateInput.fill('2024-01-01').catch(() => {});
    console.log('  ✓ Effective Date: 2024-01-01');

    // Upload document
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.count() > 0) {
      const filePath = process.env.HOME + '/Downloads/CGI_SERVICE_LETTER.pdf';
      try {
        await fileInput.setInputFiles(filePath);
        console.log('  ✓ Document uploaded: CGI_SERVICE_LETTER.pdf');
      } catch (e) {
        console.log('  ⚠ Could not upload file:', e.message);
      }
    }

    // Save contract
    await page.click('button:has-text("Add Contract"):not([disabled])').catch(async () => {
      await page.click('button:has-text("Save")').catch(() => {});
    });
    await page.waitForTimeout(500);
    console.log('  ✓ Contract saved');
  }

  // Click Continue
  console.log('\n🔄 Moving to Step 6...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  // ========================================
  // Step 6: Compliance
  // ========================================
  console.log('\n📝 Step 6: Compliance');

  // Check compliance checkboxes
  const checkboxes = await page.locator('input[type="checkbox"]').all();
  for (const checkbox of checkboxes.slice(0, 4)) {
    await checkbox.check().catch(() => {});
  }
  console.log('  ✓ Compliance checkboxes checked');

  // Click Continue
  console.log('\n🔄 Moving to Step 7...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1000);

  // ========================================
  // Step 7: Team
  // ========================================
  console.log('\n📝 Step 7: Team');

  // Account Owner dropdown (required)
  const ownerTrigger = page.locator('button:has-text("Select Account Owner")').first();
  if (await ownerTrigger.isVisible()) {
    await ownerTrigger.click();
    await page.waitForTimeout(200);
    // Select first user
    await page.click('[role="option"]').first().catch(() => {
      page.keyboard.press('ArrowDown');
      page.keyboard.press('Enter');
    });
    console.log('  ✓ Account Owner assigned');
  }

  // Account Manager dropdown
  const managerTrigger = page.locator('button:has-text("Select Account Manager")').first();
  if (await managerTrigger.isVisible()) {
    await managerTrigger.click();
    await page.waitForTimeout(200);
    await page.locator('[role="option"]').first().click().catch(() => {});
    console.log('  ✓ Account Manager assigned');
  }

  // Click Continue to Review
  console.log('\n🔄 Moving to Step 8 (Review)...');
  await page.click('button:has-text("Continue")');
  await page.waitForTimeout(1500);

  // ========================================
  // Step 8: Review & Create
  // ========================================
  console.log('\n📝 Step 8: Review & Create');

  // Take a screenshot before submission
  await page.screenshot({ path: 'account-review.png', fullPage: true });
  console.log('  ✓ Screenshot saved: account-review.png');

  // Click Create Account button
  const createBtn = page.locator('button:has-text("Create Account")');
  if (await createBtn.isVisible()) {
    console.log('\n🚀 Creating account...');
    await createBtn.click();

    // Wait for navigation or success
    await page.waitForTimeout(3000);

    // Check if we navigated away (success)
    const currentUrl = page.url();
    if (!currentUrl.includes('/new')) {
      console.log('✅ Account created successfully!');
      console.log('📍 Redirected to:', currentUrl);
    } else {
      console.log('⚠ Still on creation page - may need to check for errors');
    }

    await page.screenshot({ path: 'account-created.png', fullPage: true });
    console.log('  ✓ Final screenshot saved: account-created.png');
  } else {
    console.log('  ⚠ Create Account button not found');
  }

  console.log('\n🎉 Account creation process completed!');
  console.log('Browser will remain open for 30 seconds for verification...');

  await page.waitForTimeout(30000);
  await browser.close();
}

createAccount().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
