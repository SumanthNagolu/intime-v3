import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Scale } from 'lucide-react';

export default function LegalPage() {
  return (
    <IndustryTemplate
      title="Legal Technology"
      description="Streamlining practice management and discovery with secure, AI-enhanced legal tech."
      icon={Scale}
      stats={[
        { label: "Law Firms", value: "20+" },
        { label: "E-Discovery", value: "10TB+" },
        { label: "Case Mgmt", value: "Clio/Relativity" },
        { label: "Security", value: "ISO 27001" }
      ]}
      challenges={[
        {
          title: "Data Volume",
          description: "Managing massive volumes of unstructured data for E-Discovery requires specialized infrastructure."
        },
        {
          title: "Confidentiality",
          description: "Client privilege demands the highest standards of data encryption and access control."
        }
      ]}
      solutions={[
        {
          title: "Legal AI",
          description: "Implementing NLP models for contract review and case prediction."
        },
        {
          title: "Secure Infrastructure",
          description: "Private cloud architectures designed for sensitive legal workloads."
        }
      ]}
    />
  );
}


