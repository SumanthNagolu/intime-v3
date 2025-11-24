import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Coffee } from 'lucide-react';

export default function HospitalityPage() {
  return (
    <IndustryTemplate
      title="Hospitality & Travel"
      description="Enhancing guest experiences through integrated digital platforms and data-driven personalization."
      icon={Coffee}
      stats={[
        { label: "Hotel Chains", value: "8" },
        { label: "POS Rollouts", value: "500+" },
        { label: "Booking Engines", value: "20+" },
        { label: "Uptime", value: "99.99%" }
      ]}
      challenges={[
        {
          title: "Omnichannel Experience",
          description: "Guests expect a seamless transition from mobile booking to digital check-in to room control."
        },
        {
          title: "Data Unification",
          description: "Integrating data from PMS, CRS, and CRM systems to create a single view of the guest."
        }
      ]}
      solutions={[
        {
          title: "Digital Experience Platforms",
          description: "Developers skilled in Adobe Experience Manager (AEM) and Sitecore."
        },
        {
          title: "Mobile First",
          description: "Native iOS and Android expertise for guest companion apps."
        }
      ]}
    />
  );
}


