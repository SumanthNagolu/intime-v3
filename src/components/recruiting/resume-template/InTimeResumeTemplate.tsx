'use client'

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Link,
} from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff2', fontWeight: 500 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 600 },
    { src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', fontWeight: 700 },
  ],
})

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#171717',
    backgroundColor: '#FFFFFF',
  },
  // Header Section
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #C9A961',
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  candidateName: {
    fontSize: 24,
    fontWeight: 700,
    color: '#171717',
    marginBottom: 4,
  },
  headline: {
    fontSize: 12,
    color: '#525252',
    fontWeight: 500,
  },
  brandBadge: {
    backgroundColor: '#171717',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  brandText: {
    color: '#C9A961',
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactLabel: {
    fontSize: 8,
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactValue: {
    fontSize: 10,
    color: '#171717',
  },
  // Section styling
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#171717',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1px solid #E5E5E5',
  },
  // Summary
  summary: {
    fontSize: 10,
    color: '#404040',
    lineHeight: 1.5,
  },
  // Skills
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillBadge: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    borderLeft: '2px solid #C9A961',
  },
  skillText: {
    fontSize: 9,
    color: '#404040',
  },
  primarySkillBadge: {
    backgroundColor: '#FEF9E7',
    borderLeftColor: '#C9A961',
  },
  // Experience
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: '#171717',
  },
  company: {
    fontSize: 10,
    color: '#525252',
  },
  dateRange: {
    fontSize: 9,
    color: '#737373',
    fontWeight: 500,
  },
  experienceDescription: {
    fontSize: 9,
    color: '#525252',
    lineHeight: 1.5,
    marginTop: 4,
  },
  bulletPoint: {
    fontSize: 9,
    color: '#525252',
    marginLeft: 10,
    marginTop: 2,
  },
  // Education
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 10,
    fontWeight: 600,
    color: '#171717',
  },
  institution: {
    fontSize: 9,
    color: '#525252',
  },
  // Two column layout
  twoColumn: {
    flexDirection: 'row',
    gap: 20,
  },
  mainColumn: {
    flex: 2,
  },
  sideColumn: {
    flex: 1,
  },
  // Info box
  infoBox: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 4,
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 8,
    color: '#737373',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 10,
    color: '#171717',
    fontWeight: 500,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTop: '1px solid #E5E5E5',
  },
  footerText: {
    fontSize: 8,
    color: '#A3A3A3',
  },
  footerBrand: {
    fontSize: 8,
    color: '#C9A961',
    fontWeight: 600,
  },
  // Certification
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  certBullet: {
    width: 4,
    height: 4,
    backgroundColor: '#C9A961',
    borderRadius: 2,
  },
  certText: {
    fontSize: 9,
    color: '#404040',
  },
  // Metadata section (hidden/small)
  metadata: {
    marginTop: 10,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  metadataText: {
    fontSize: 7,
    color: '#A3A3A3',
    fontFamily: 'Courier',
  },
})

// Types
export interface WorkHistoryItem {
  title: string
  company: string
  startDate?: string
  endDate?: string
  description?: string
  highlights?: string[]
  location?: string
}

export interface EducationItem {
  degree: string
  institution: string
  year?: string
  field?: string
}

export interface SkillItem {
  name: string
  isPrimary?: boolean
  proficiency?: string
}

export interface CertificationItem {
  name: string
  issuer?: string
  date?: string
}

export interface InTimeResumeData {
  // Identity
  id?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  mobile?: string
  linkedinUrl?: string
  city?: string
  state?: string
  country?: string

  // Professional
  headline?: string
  summary?: string
  yearsExperience?: number
  currentCompany?: string

  // Work
  workHistory?: WorkHistoryItem[]
  education?: EducationItem[]
  skills?: SkillItem[]
  certifications?: CertificationItem[]

  // Authorization
  visaStatus?: string

  // Compensation
  desiredRate?: number
  rateType?: string
  currency?: string

  // Metadata
  generatedAt?: string
  version?: string
}

// Helper to format date
function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Present'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}

// Helper to format visa status
function formatVisaStatus(status?: string): string {
  const statusMap: Record<string, string> = {
    us_citizen: 'US Citizen',
    green_card: 'Green Card Holder',
    h1b: 'H-1B Visa',
    l1: 'L-1 Visa',
    tn: 'TN Visa',
    opt: 'OPT',
    cpt: 'CPT',
    ead: 'EAD',
    other: 'Other',
  }
  return statusMap[status || ''] || status || 'Not Specified'
}

// Main Template Component
export function InTimeResumeTemplate({ data }: { data: InTimeResumeData }) {
  const fullName = `${data.firstName} ${data.lastName}`
  const location = [data.city, data.state, data.country].filter(Boolean).join(', ')
  const primarySkills = (data.skills || []).filter(s => s.isPrimary)
  const otherSkills = (data.skills || []).filter(s => !s.isPrimary)

  // Generate metadata JSON for re-import
  const metadataJson = JSON.stringify({
    _intime_format: 'v1',
    _generated: data.generatedAt || new Date().toISOString(),
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    city: data.city,
    state: data.state,
    country: data.country,
    headline: data.headline,
    yearsExperience: data.yearsExperience,
    visaStatus: data.visaStatus,
    skills: (data.skills || []).map(s => s.name),
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.candidateName}>{fullName}</Text>
              {data.headline && (
                <Text style={styles.headline}>{data.headline}</Text>
              )}
            </View>
            <View style={styles.brandBadge}>
              <Text style={styles.brandText}>INTIME SOLUTIONS</Text>
            </View>
          </View>

          <View style={styles.contactRow}>
            {data.email && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Email</Text>
                <Text style={styles.contactValue}>{data.email}</Text>
              </View>
            )}
            {data.phone && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Phone</Text>
                <Text style={styles.contactValue}>{data.phone}</Text>
              </View>
            )}
            {location && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>Location</Text>
                <Text style={styles.contactValue}>{location}</Text>
              </View>
            )}
            {data.linkedinUrl && (
              <View style={styles.contactItem}>
                <Text style={styles.contactLabel}>LinkedIn</Text>
                <Link src={data.linkedinUrl} style={styles.contactValue}>
                  Profile
                </Link>
              </View>
            )}
          </View>
        </View>

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Main Column */}
          <View style={styles.mainColumn}>
            {/* Summary */}
            {data.summary && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Professional Summary</Text>
                <Text style={styles.summary}>{data.summary}</Text>
              </View>
            )}

            {/* Work Experience */}
            {data.workHistory && data.workHistory.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Work Experience</Text>
                {data.workHistory.map((job, index) => (
                  <View key={index} style={styles.experienceItem}>
                    <View style={styles.experienceHeader}>
                      <View>
                        <Text style={styles.jobTitle}>{job.title}</Text>
                        <Text style={styles.company}>{job.company}{job.location ? ` - ${job.location}` : ''}</Text>
                      </View>
                      <Text style={styles.dateRange}>
                        {formatDate(job.startDate)} - {formatDate(job.endDate)}
                      </Text>
                    </View>
                    {job.description && (
                      <Text style={styles.experienceDescription}>{job.description}</Text>
                    )}
                    {job.highlights && job.highlights.map((highlight, hIndex) => (
                      <Text key={hIndex} style={styles.bulletPoint}>• {highlight}</Text>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Education</Text>
                {data.education.map((edu, index) => (
                  <View key={index} style={styles.educationItem}>
                    <Text style={styles.degree}>
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </Text>
                    <Text style={styles.institution}>
                      {edu.institution}{edu.year ? ` - ${edu.year}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Side Column */}
          <View style={styles.sideColumn}>
            {/* Quick Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>At a Glance</Text>

              {data.yearsExperience !== undefined && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Experience</Text>
                  <Text style={styles.infoValue}>{data.yearsExperience} Years</Text>
                </View>
              )}

              {data.visaStatus && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Work Authorization</Text>
                  <Text style={styles.infoValue}>{formatVisaStatus(data.visaStatus)}</Text>
                </View>
              )}

              {data.desiredRate && (
                <View style={styles.infoBox}>
                  <Text style={styles.infoLabel}>Rate Expectation</Text>
                  <Text style={styles.infoValue}>
                    {data.currency || 'USD'} {data.desiredRate}/{data.rateType === 'hourly' ? 'hr' : 'yr'}
                  </Text>
                </View>
              )}
            </View>

            {/* Primary Skills */}
            {primarySkills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Core Skills</Text>
                <View style={styles.skillsGrid}>
                  {primarySkills.map((skill, index) => (
                    <View key={index} style={[styles.skillBadge, styles.primarySkillBadge]}>
                      <Text style={styles.skillText}>{skill.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Other Skills */}
            {otherSkills.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Additional Skills</Text>
                <View style={styles.skillsGrid}>
                  {otherSkills.slice(0, 10).map((skill, index) => (
                    <View key={index} style={styles.skillBadge}>
                      <Text style={styles.skillText}>{skill.name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Certifications</Text>
                {data.certifications.map((cert, index) => (
                  <View key={index} style={styles.certificationItem}>
                    <View style={styles.certBullet} />
                    <Text style={styles.certText}>
                      {cert.name}{cert.issuer ? ` (${cert.issuer})` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Metadata (for re-import) - small text at bottom */}
        <View style={styles.metadata}>
          <Text style={styles.metadataText}>
            InTime Format v1 | {metadataJson.substring(0, 100)}...
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.footerBrand}>
            InTime Solutions | Confidential
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Export type for use in other components
export type { InTimeResumeData as ResumeData }
