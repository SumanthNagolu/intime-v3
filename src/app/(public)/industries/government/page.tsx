import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Building2 } from 'lucide-react';

export default function GovernmentPage() {
  return (
    <IndustryTemplate
      title="Government & Public Sector"
      description="Modernizing public infrastructure with secure, compliant, and accessible technology solutions."
      icon={Building2}
      stats={[
        { label: "Agencies", value: "15+" },
        { label: "Clearance", value: "Top Secret" },
        { label: "Accessibility", value: "WCAG AA" },
        { label: "Cloud Migrations", value: "50+" }
      ]}
      challenges={[
        {
          title: "Legacy Modernization",
          description: "Updating critical mainframes (COBOL) to modern cloud architectures without service interruption."
        },
        {
          title: "Security & Compliance",
          description: "Strict adherence to FedRAMP, FISMA, and NIST standards is non-negotiable."
        }
      ]}
      solutions={[
        {
          title: "Cleared Talent",
          description: "We maintain a bench of professionals with active Public Trust and Secret clearances."
        },
        {
          title: "GovCloud Expertise",
          description: "Architects specialized in AWS GovCloud and Azure Government environments."
        }
      ]}
    />
  );
}


