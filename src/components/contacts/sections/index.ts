/**
 * Contact Section Components
 *
 * These sections are used in the ContactWorkspace to display and edit
 * contact data based on the contact's category (person/company) and subtype.
 */

// Universal sections - available for all contacts
export { BasicDetailsSection } from './BasicDetailsSection'
export { AddressesSection } from './AddressesSection'
export { ContactActivitiesSection } from './ContactActivitiesSection'
export { ContactNotesSection } from './ContactNotesSection'
export { ContactDocumentsSection } from './ContactDocumentsSection'
export { HistorySection } from './HistorySection'

// Person-specific sections
export { SkillsSection } from './SkillsSection'
export { WorkHistorySection } from './WorkHistorySection'
export { EducationSection } from './EducationSection'
export { CertificationsSection } from './CertificationsSection'
export { RelationshipsSection } from './RelationshipsSection'
export { PipelineSection } from './PipelineSection'

// Company-specific sections
export { CompanyOverviewSection } from './CompanyOverviewSection'
export { CompanyContactsSection } from './CompanyContactsSection'
export { AgreementsSection } from './AgreementsSection'
export { SubsidiariesSection } from './SubsidiariesSection'

// Subtype-specific sections
export { QualificationSection } from './QualificationSection'
export { EngagementSection } from './EngagementSection'
export { DealsSection } from './DealsSection'
