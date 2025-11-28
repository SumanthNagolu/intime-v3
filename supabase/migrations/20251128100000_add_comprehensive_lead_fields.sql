-- Migration: Add Comprehensive Lead Fields
-- Description: Extends the leads table with ATS/CRM-level fields for staffing industry

-- Add new columns to leads table if they don't exist
DO $$
BEGIN
    -- Company fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company_type') THEN
        ALTER TABLE leads ADD COLUMN company_type TEXT;
        COMMENT ON COLUMN leads.company_type IS 'Type of company: direct_client, implementation_partner, msp_vms, system_integrator';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'website') THEN
        ALTER TABLE leads ADD COLUMN website TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'headquarters') THEN
        ALTER TABLE leads ADD COLUMN headquarters TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'tier') THEN
        ALTER TABLE leads ADD COLUMN tier TEXT;
        COMMENT ON COLUMN leads.tier IS 'Account tier: enterprise, mid_market, smb, strategic';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'company_description') THEN
        ALTER TABLE leads ADD COLUMN company_description TEXT;
    END IF;

    -- Contact fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'decision_authority') THEN
        ALTER TABLE leads ADD COLUMN decision_authority TEXT;
        COMMENT ON COLUMN leads.decision_authority IS 'Decision authority: decision_maker, influencer, gatekeeper, end_user, champion';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'preferred_contact_method') THEN
        ALTER TABLE leads ADD COLUMN preferred_contact_method TEXT DEFAULT 'email';
    END IF;

    -- Link to existing account (for person leads)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'account_id') THEN
        ALTER TABLE leads ADD COLUMN account_id UUID REFERENCES accounts(id);
        CREATE INDEX IF NOT EXISTS idx_leads_account_id ON leads(account_id);
    END IF;

    -- Notes field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'notes') THEN
        ALTER TABLE leads ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE leads IS 'CRM leads for recruiting/staffing - can be company or person type';
