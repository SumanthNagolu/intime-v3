import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Cog } from 'lucide-react';

export default function EngineeringPage() {
  return (
    <IndustryTemplate
      title="Engineering"
      description="Supporting physical engineering disciplines with specialized software and design tools."
      icon={Cog}
      stats={[
        { label: "CAD Experts", value: "40+" },
        { label: "PLM Projects", value: "15" },
        { label: "Simulation", value: "Ansys" },
        { label: "Sectors", value: "Aero/Auto" }
      ]}
      challenges={[
        {
          title: "Digital Twin",
          description: "Creating accurate digital replicas of physical assets for simulation and monitoring."
        },
        {
          title: "Collaboration",
          description: "Enabling global engineering teams to work on massive CAD assemblies simultaneously."
        }
      ]}
      solutions={[
        {
          title: "PLM Implementation",
          description: "Product Lifecycle Management (Teamcenter, Windchill) configuration."
        },
        {
          title: "Simulation Software",
          description: "High-performance computing (HPC) support for complex simulations."
        }
      ]}
    />
  );
}


