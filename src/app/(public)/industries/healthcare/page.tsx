import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { HeartPulse } from 'lucide-react';

export default function HealthcarePage() {
  return (
    <IndustryTemplate
      title="Healthcare"
      description="Navigating the intersection of patient care, data privacy, and technological innovation with specialized healthcare IT talent."
      icon={HeartPulse}
      stats={[
        { label: "HIPAA Experts", value: "150+" },
        { label: "Hospitals Served", value: "25+" },
        { label: "EHR Projects", value: "40+" },
        { label: "Compliance", value: "100%" }
      ]}
      challenges={[
        {
          title: "Regulatory Compliance",
          description: "HIPAA, HITECH, and GDPR requirements make hiring non-specialized IT talent a massive risk."
        },
        {
          title: "Interoperability",
          description: "Connecting legacy EHR systems with modern patient portals requires niche expertise (HL7, FHIR)."
        }
      ]}
      solutions={[
        {
          title: "Compliance-First Vetting",
          description: "Every candidate is screened for regulatory knowledge and data privacy best practices."
        },
        {
          title: "EHR Specialists",
          description: "We maintain a dedicated bench of Epic, Cerner, and Meditech certified professionals."
        }
      ]}
    />
  );
}


