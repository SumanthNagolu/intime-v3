import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Radio } from 'lucide-react';

export default function TelecomPage() {
  return (
    <IndustryTemplate
      title="Telecommunications"
      description="Powering the 5G revolution and next-gen network infrastructure."
      icon={Radio}
      stats={[
        { label: "Carriers", value: "5+" },
        { label: "5G Projects", value: "12" },
        { label: "OSS/BSS", value: "Expert" },
        { label: "Network Eng", value: "100+" }
      ]}
      challenges={[
        {
          title: "Network Virtualization",
          description: "Transitioning from hardware appliances to NFV and SDN architectures."
        },
        {
          title: "Billing Complexity",
          description: "Managing complex rating and charging scenarios for modern digital services."
        }
      ]}
      solutions={[
        {
          title: "OSS/BSS Transformation",
          description: "Modernizing Operations and Business Support Systems for agility."
        },
        {
          title: "Cloud-Native Networks",
          description: "Deploying network functions as microservices in Kubernetes environments."
        }
      ]}
    />
  );
}


