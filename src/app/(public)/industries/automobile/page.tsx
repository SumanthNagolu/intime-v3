import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Truck } from 'lucide-react';

export default function AutomobilePage() {
  return (
    <IndustryTemplate
      title="Automobile"
      description="Accelerating the shift to electric, autonomous, and connected mobility with specialized engineering talent."
      icon={Truck}
      stats={[
        { label: "OEM Clients", value: "12" },
        { label: "EV Projects", value: "25+" },
        { label: "Embedded Eng", value: "150+" },
        { label: "R&D Hours", value: "1M+" }
      ]}
      challenges={[
        {
          title: "The Software-Defined Vehicle",
          description: "Modern cars are data centers on wheels. Traditional mechanical skills must be augmented with embedded software expertise."
        },
        {
          title: "Supply Chain Resilience",
          description: "Just-in-time manufacturing requires sophisticated ERP and logistics software to manage volatility."
        }
      ]}
      solutions={[
        {
          title: "Embedded Systems",
          description: "We source engineers skilled in AUTOSAR, C/C++, and Real-Time Operating Systems (RTOS)."
        },
        {
          title: "Connected Car Platforms",
          description: "Expertise in IoT, 5G connectivity, and cloud data ingestion for vehicle telemetry."
        }
      ]}
    />
  );
}


