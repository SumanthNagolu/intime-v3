-- ============================================
-- PHASE 5: Legacy Cleanup - Backward-Compatible Views
-- Creates views mapping legacy table interfaces to new unified tables
-- Shadow Period: Legacy code can read from views while migrating
-- ============================================

-- ============================================
-- CONTACT COMPLIANCE LEGACY VIEW
-- Maps: contact_compliance → compliance_items (entity_type='contact')
-- ============================================

CREATE OR REPLACE VIEW contact_compliance_legacy AS
SELECT
  ci.id,
  ci.org_id,
  ci.entity_id AS contact_id,
  COALESCE(ci.compliance_type, cr.category) AS compliance_type,
  -- Map new enum status to legacy text values
  CASE ci.status::text
    WHEN 'pending' THEN 'pending'
    WHEN 'received' THEN 'received'
    WHEN 'under_review' THEN 'received'
    WHEN 'verified' THEN 'verified'
    WHEN 'expiring' THEN 'expiring'
    WHEN 'expired' THEN 'expired'
    WHEN 'rejected' THEN 'rejected'
    WHEN 'waived' THEN 'verified'  -- Waived items appear verified for legacy
    ELSE 'pending'
  END AS status,
  ci.document_url,
  ci.document_received_at,
  ci.effective_date,
  ci.expiry_date,
  ci.verified_by,
  ci.verified_at,
  ci.verification_notes,
  ci.policy_number,
  ci.coverage_amount,
  ci.insurance_carrier,
  ci.expiry_alert_sent_at,
  ci.created_at,
  ci.updated_at,
  ci.deleted_at
FROM compliance_items ci
LEFT JOIN compliance_requirements cr ON cr.id = ci.requirement_id
WHERE ci.entity_type = 'contact';

COMMENT ON VIEW contact_compliance_legacy IS 'DEPRECATED: Backward-compatible view for legacy contact_compliance table. Use compliance_items directly.';

-- ============================================
-- CONTACT AGREEMENTS LEGACY VIEW
-- Maps: contact_agreements → contracts (entity_type='contact')
-- ============================================

CREATE OR REPLACE VIEW contact_agreements_legacy AS
SELECT
  c.id,
  c.org_id,
  c.entity_id AS contact_id,
  -- Map contract_type enum to legacy agreement_type text
  CASE c.contract_type::text
    WHEN 'msa' THEN 'msa'
    WHEN 'nda' THEN 'nda'
    WHEN 'sow' THEN 'sow'
    WHEN 'rate_card_agreement' THEN 'rate_card'
    WHEN 'sla' THEN 'sla'
    WHEN 'vendor_agreement' THEN 'vendor_agreement'
    ELSE 'other'
  END AS agreement_type,
  c.contract_name AS agreement_name,
  c.effective_date,
  c.expiry_date,
  c.auto_renew,
  c.renewal_notice_days,
  -- Map contract_status enum to legacy status text
  CASE c.status::text
    WHEN 'draft' THEN 'draft'
    WHEN 'pending_review' THEN 'pending'
    WHEN 'pending_signature' THEN 'pending'
    WHEN 'partially_signed' THEN 'pending'
    WHEN 'active' THEN 'active'
    WHEN 'expired' THEN 'expired'
    WHEN 'terminated' THEN 'terminated'
    WHEN 'renewed' THEN 'active'
    WHEN 'superseded' THEN 'expired'
    ELSE 'draft'
  END AS status,
  c.document_url,
  c.signed_document_url,
  -- Get our signer from contract_parties
  (
    SELECT cp.user_id
    FROM contract_parties cp
    WHERE cp.contract_id = c.id
      AND cp.party_type = 'internal'
      AND cp.is_required = true
    LIMIT 1
  ) AS our_signer_id,
  (
    SELECT cp.signed_at
    FROM contract_parties cp
    WHERE cp.contract_id = c.id
      AND cp.party_type = 'internal'
      AND cp.is_required = true
      AND cp.signatory_status = 'signed'
    LIMIT 1
  ) AS our_signed_at,
  -- Get their signer name from contract_parties
  (
    SELECT COALESCE(cp.party_name, CONCAT_WS(' ', ct.first_name, ct.last_name))
    FROM contract_parties cp
    LEFT JOIN contacts ct ON ct.id = cp.contact_id
    WHERE cp.contract_id = c.id
      AND cp.party_type != 'internal'
      AND cp.is_required = true
    LIMIT 1
  ) AS their_signer_name,
  (
    SELECT cp.signed_at
    FROM contract_parties cp
    WHERE cp.contract_id = c.id
      AND cp.party_type != 'internal'
      AND cp.is_required = true
      AND cp.signatory_status = 'signed'
    LIMIT 1
  ) AS their_signed_at,
  c.terms,
  c.created_at,
  c.updated_at,
  c.deleted_at
FROM contracts c
WHERE c.entity_type = 'contact';

COMMENT ON VIEW contact_agreements_legacy IS 'DEPRECATED: Backward-compatible view for legacy contact_agreements table. Use contracts directly.';

-- ============================================
-- CONTACT RATE CARDS LEGACY VIEW
-- Maps: contact_rate_cards → entity_rates (entity_type='contact')
-- ============================================

CREATE OR REPLACE VIEW contact_rate_cards_legacy AS
SELECT
  er.id,
  er.org_id,
  er.entity_id AS contact_id,
  er.context_client_id AS client_id,
  NULL::uuid AS skill_id,  -- Legacy field, map from rate_card_items if needed
  er.context_job_id AS job_id,
  er.bill_rate AS bill_rate_hourly,
  er.pay_rate AS pay_rate_hourly,
  er.markup_percentage,
  -- Calculate OT multiplier from rates if available
  CASE
    WHEN er.pay_rate > 0 AND er.ot_pay_rate IS NOT NULL
    THEN ROUND((er.ot_pay_rate / er.pay_rate)::numeric, 2)
    ELSE 1.5
  END AS overtime_multiplier,
  er.effective_date,
  er.end_date AS expiry_date,
  er.is_current AS is_active,
  er.approved_by,
  er.approved_at,
  er.negotiation_notes AS notes,
  er.created_at,
  er.updated_at,
  er.deleted_at
FROM entity_rates er
WHERE er.entity_type = 'contact';

COMMENT ON VIEW contact_rate_cards_legacy IS 'DEPRECATED: Backward-compatible view for legacy contact_rate_cards table. Use entity_rates directly.';

-- ============================================
-- CREATE INSTEAD OF TRIGGERS FOR INSERT/UPDATE/DELETE
-- These allow legacy code to write through the views
-- ============================================

-- CONTACT COMPLIANCE INSERT TRIGGER
CREATE OR REPLACE FUNCTION contact_compliance_legacy_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO compliance_items (
    org_id,
    entity_type,
    entity_id,
    compliance_type,
    status,
    document_url,
    document_received_at,
    effective_date,
    expiry_date,
    verified_by,
    verified_at,
    verification_notes,
    policy_number,
    coverage_amount,
    insurance_carrier,
    expiry_alert_sent_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.org_id,
    'contact',
    NEW.contact_id,
    NEW.compliance_type,
    COALESCE(NEW.status, 'pending')::compliance_item_status,
    NEW.document_url,
    NEW.document_received_at,
    NEW.effective_date,
    NEW.expiry_date,
    NEW.verified_by,
    NEW.verified_at,
    NEW.verification_notes,
    NEW.policy_number,
    NEW.coverage_amount,
    NEW.insurance_carrier,
    NEW.expiry_alert_sent_at,
    COALESCE(NEW.created_at, now()),
    COALESCE(NEW.updated_at, now())
  )
  RETURNING id INTO NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_compliance_legacy_insert_trigger
INSTEAD OF INSERT ON contact_compliance_legacy
FOR EACH ROW EXECUTE FUNCTION contact_compliance_legacy_insert();

-- CONTACT COMPLIANCE UPDATE TRIGGER
CREATE OR REPLACE FUNCTION contact_compliance_legacy_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE compliance_items SET
    compliance_type = NEW.compliance_type,
    status = NEW.status::compliance_item_status,
    document_url = NEW.document_url,
    document_received_at = NEW.document_received_at,
    effective_date = NEW.effective_date,
    expiry_date = NEW.expiry_date,
    verified_by = NEW.verified_by,
    verified_at = NEW.verified_at,
    verification_notes = NEW.verification_notes,
    policy_number = NEW.policy_number,
    coverage_amount = NEW.coverage_amount,
    insurance_carrier = NEW.insurance_carrier,
    expiry_alert_sent_at = NEW.expiry_alert_sent_at,
    updated_at = now()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_compliance_legacy_update_trigger
INSTEAD OF UPDATE ON contact_compliance_legacy
FOR EACH ROW EXECUTE FUNCTION contact_compliance_legacy_update();

-- CONTACT COMPLIANCE DELETE TRIGGER (soft delete)
CREATE OR REPLACE FUNCTION contact_compliance_legacy_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE compliance_items SET deleted_at = now() WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_compliance_legacy_delete_trigger
INSTEAD OF DELETE ON contact_compliance_legacy
FOR EACH ROW EXECUTE FUNCTION contact_compliance_legacy_delete();

-- CONTACT AGREEMENTS INSERT TRIGGER
CREATE OR REPLACE FUNCTION contact_agreements_legacy_insert()
RETURNS TRIGGER AS $$
DECLARE
  v_contract_type contract_type;
  v_contract_status contract_status;
  v_contract_id uuid;
BEGIN
  -- Map legacy agreement_type to contract_type enum
  v_contract_type := CASE NEW.agreement_type
    WHEN 'msa' THEN 'msa'
    WHEN 'nda' THEN 'nda'
    WHEN 'sow' THEN 'sow'
    WHEN 'rate_card' THEN 'rate_card_agreement'
    WHEN 'sla' THEN 'sla'
    WHEN 'vendor_agreement' THEN 'vendor_agreement'
    ELSE 'other'
  END::contract_type;

  -- Map legacy status to contract_status enum
  v_contract_status := CASE NEW.status
    WHEN 'draft' THEN 'draft'
    WHEN 'pending' THEN 'pending_signature'
    WHEN 'active' THEN 'active'
    WHEN 'expired' THEN 'expired'
    WHEN 'terminated' THEN 'terminated'
    ELSE 'draft'
  END::contract_status;

  INSERT INTO contracts (
    org_id,
    entity_type,
    entity_id,
    contract_name,
    contract_type,
    effective_date,
    expiry_date,
    auto_renew,
    renewal_notice_days,
    status,
    document_url,
    signed_document_url,
    terms,
    created_at,
    updated_at
  ) VALUES (
    NEW.org_id,
    'contact',
    NEW.contact_id,
    COALESCE(NEW.agreement_name, 'Agreement'),
    v_contract_type,
    NEW.effective_date,
    NEW.expiry_date,
    COALESCE(NEW.auto_renew, false),
    COALESCE(NEW.renewal_notice_days, 30),
    v_contract_status,
    NEW.document_url,
    NEW.signed_document_url,
    COALESCE(NEW.terms, '{}'::jsonb),
    COALESCE(NEW.created_at, now()),
    COALESCE(NEW.updated_at, now())
  )
  RETURNING id INTO v_contract_id;

  NEW.id := v_contract_id;

  -- Insert internal signer if provided
  IF NEW.our_signer_id IS NOT NULL THEN
    INSERT INTO contract_parties (
      org_id,
      contract_id,
      party_type,
      party_role,
      user_id,
      signatory_status,
      signed_at,
      signing_order,
      is_required
    ) VALUES (
      NEW.org_id,
      v_contract_id,
      'internal',
      'company',
      NEW.our_signer_id,
      CASE WHEN NEW.our_signed_at IS NOT NULL THEN 'signed' ELSE 'pending' END::signatory_status,
      NEW.our_signed_at,
      1,
      true
    );
  END IF;

  -- Insert external signer if provided
  IF NEW.their_signer_name IS NOT NULL THEN
    INSERT INTO contract_parties (
      org_id,
      contract_id,
      party_type,
      party_role,
      party_name,
      signatory_status,
      signed_at,
      signing_order,
      is_required
    ) VALUES (
      NEW.org_id,
      v_contract_id,
      'individual',
      'client',
      NEW.their_signer_name,
      CASE WHEN NEW.their_signed_at IS NOT NULL THEN 'signed' ELSE 'pending' END::signatory_status,
      NEW.their_signed_at,
      2,
      true
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_agreements_legacy_insert_trigger
INSTEAD OF INSERT ON contact_agreements_legacy
FOR EACH ROW EXECUTE FUNCTION contact_agreements_legacy_insert();

-- CONTACT AGREEMENTS UPDATE TRIGGER
CREATE OR REPLACE FUNCTION contact_agreements_legacy_update()
RETURNS TRIGGER AS $$
DECLARE
  v_contract_type contract_type;
  v_contract_status contract_status;
BEGIN
  -- Map legacy agreement_type to contract_type enum
  v_contract_type := CASE NEW.agreement_type
    WHEN 'msa' THEN 'msa'
    WHEN 'nda' THEN 'nda'
    WHEN 'sow' THEN 'sow'
    WHEN 'rate_card' THEN 'rate_card_agreement'
    WHEN 'sla' THEN 'sla'
    WHEN 'vendor_agreement' THEN 'vendor_agreement'
    ELSE 'other'
  END::contract_type;

  -- Map legacy status to contract_status enum
  v_contract_status := CASE NEW.status
    WHEN 'draft' THEN 'draft'
    WHEN 'pending' THEN 'pending_signature'
    WHEN 'active' THEN 'active'
    WHEN 'expired' THEN 'expired'
    WHEN 'terminated' THEN 'terminated'
    ELSE 'draft'
  END::contract_status;

  UPDATE contracts SET
    contract_name = COALESCE(NEW.agreement_name, contract_name),
    contract_type = v_contract_type,
    effective_date = NEW.effective_date,
    expiry_date = NEW.expiry_date,
    auto_renew = COALESCE(NEW.auto_renew, auto_renew),
    renewal_notice_days = COALESCE(NEW.renewal_notice_days, renewal_notice_days),
    status = v_contract_status,
    document_url = NEW.document_url,
    signed_document_url = NEW.signed_document_url,
    terms = COALESCE(NEW.terms, terms),
    updated_at = now()
  WHERE id = OLD.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_agreements_legacy_update_trigger
INSTEAD OF UPDATE ON contact_agreements_legacy
FOR EACH ROW EXECUTE FUNCTION contact_agreements_legacy_update();

-- CONTACT AGREEMENTS DELETE TRIGGER (soft delete)
CREATE OR REPLACE FUNCTION contact_agreements_legacy_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contracts SET deleted_at = now() WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_agreements_legacy_delete_trigger
INSTEAD OF DELETE ON contact_agreements_legacy
FOR EACH ROW EXECUTE FUNCTION contact_agreements_legacy_delete();

-- CONTACT RATE CARDS INSERT TRIGGER
CREATE OR REPLACE FUNCTION contact_rate_cards_legacy_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO entity_rates (
    org_id,
    entity_type,
    entity_id,
    rate_unit,
    currency,
    bill_rate,
    pay_rate,
    ot_bill_rate,
    ot_pay_rate,
    effective_date,
    end_date,
    is_current,
    approved_by,
    approved_at,
    negotiation_notes,
    context_client_id,
    context_job_id,
    created_at,
    updated_at
  ) VALUES (
    NEW.org_id,
    'contact',
    NEW.contact_id,
    'hourly'::rate_unit,
    'USD',
    NEW.bill_rate_hourly,
    NEW.pay_rate_hourly,
    NEW.bill_rate_hourly * COALESCE(NEW.overtime_multiplier, 1.5),
    NEW.pay_rate_hourly * COALESCE(NEW.overtime_multiplier, 1.5),
    NEW.effective_date,
    NEW.expiry_date,
    COALESCE(NEW.is_active, true),
    NEW.approved_by,
    NEW.approved_at,
    NEW.notes,
    NEW.client_id,
    NEW.job_id,
    COALESCE(NEW.created_at, now()),
    COALESCE(NEW.updated_at, now())
  )
  RETURNING id INTO NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_rate_cards_legacy_insert_trigger
INSTEAD OF INSERT ON contact_rate_cards_legacy
FOR EACH ROW EXECUTE FUNCTION contact_rate_cards_legacy_insert();

-- CONTACT RATE CARDS UPDATE TRIGGER
CREATE OR REPLACE FUNCTION contact_rate_cards_legacy_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entity_rates SET
    bill_rate = NEW.bill_rate_hourly,
    pay_rate = NEW.pay_rate_hourly,
    ot_bill_rate = NEW.bill_rate_hourly * COALESCE(NEW.overtime_multiplier, 1.5),
    ot_pay_rate = NEW.pay_rate_hourly * COALESCE(NEW.overtime_multiplier, 1.5),
    effective_date = NEW.effective_date,
    end_date = NEW.expiry_date,
    is_current = COALESCE(NEW.is_active, is_current),
    approved_by = NEW.approved_by,
    approved_at = NEW.approved_at,
    negotiation_notes = NEW.notes,
    context_client_id = NEW.client_id,
    context_job_id = NEW.job_id,
    updated_at = now()
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_rate_cards_legacy_update_trigger
INSTEAD OF UPDATE ON contact_rate_cards_legacy
FOR EACH ROW EXECUTE FUNCTION contact_rate_cards_legacy_update();

-- CONTACT RATE CARDS DELETE TRIGGER (soft delete)
CREATE OR REPLACE FUNCTION contact_rate_cards_legacy_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE entity_rates SET deleted_at = now() WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER contact_rate_cards_legacy_delete_trigger
INSTEAD OF DELETE ON contact_rate_cards_legacy
FOR EACH ROW EXECUTE FUNCTION contact_rate_cards_legacy_delete();

-- ============================================
-- DOCUMENTATION COMMENTS
-- ============================================

COMMENT ON FUNCTION contact_compliance_legacy_insert IS 'INSTEAD OF INSERT trigger for contact_compliance_legacy view. Maps to compliance_items table.';
COMMENT ON FUNCTION contact_compliance_legacy_update IS 'INSTEAD OF UPDATE trigger for contact_compliance_legacy view. Maps to compliance_items table.';
COMMENT ON FUNCTION contact_compliance_legacy_delete IS 'INSTEAD OF DELETE trigger for contact_compliance_legacy view. Soft deletes from compliance_items.';

COMMENT ON FUNCTION contact_agreements_legacy_insert IS 'INSTEAD OF INSERT trigger for contact_agreements_legacy view. Maps to contracts and contract_parties tables.';
COMMENT ON FUNCTION contact_agreements_legacy_update IS 'INSTEAD OF UPDATE trigger for contact_agreements_legacy view. Maps to contracts table.';
COMMENT ON FUNCTION contact_agreements_legacy_delete IS 'INSTEAD OF DELETE trigger for contact_agreements_legacy view. Soft deletes from contracts.';

COMMENT ON FUNCTION contact_rate_cards_legacy_insert IS 'INSTEAD OF INSERT trigger for contact_rate_cards_legacy view. Maps to entity_rates table.';
COMMENT ON FUNCTION contact_rate_cards_legacy_update IS 'INSTEAD OF UPDATE trigger for contact_rate_cards_legacy view. Maps to entity_rates table.';
COMMENT ON FUNCTION contact_rate_cards_legacy_delete IS 'INSTEAD OF DELETE trigger for contact_rate_cards_legacy view. Soft deletes from entity_rates.';
