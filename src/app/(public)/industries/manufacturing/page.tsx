import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Factory } from 'lucide-react';

export default function ManufacturingPage() {
  return (
    <IndustryTemplate
      title="Manufacturing"
      description="Embracing Industry 4.0 with IoT, predictive maintenance, and smart factory solutions."
      icon={Factory}
      stats={[
        { label: "Smart Factories", value: "10+" },
        { label: "IoT Devices", value: "100k+" },
        { label: "Downtime", value: "-40%" },
        { label: "ERP", value: "SAP/QAD" }
      ]}
      challenges={[
        {
          title: "OT/IT Convergence",
          description: "Bridging the gap between Operational Technology (machines) and Information Technology."
        },
        {
          title: "Cybersecurity",
          description: "Protecting connected industrial assets from ransomware and espionage."
        }
      ]}
      solutions={[
        {
          title: "Predictive Maintenance",
          description: "Using sensor data to predict machine failure before it happens."
        },
        {
          title: "MES Implementation",
          description: "Manufacturing Execution Systems to track production in real-time."
        }
      ]}
    />
  );
}


