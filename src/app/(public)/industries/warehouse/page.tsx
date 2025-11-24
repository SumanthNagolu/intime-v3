import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Box } from 'lucide-react';

export default function WarehousePage() {
  return (
    <IndustryTemplate
      title="Warehouse & Distribution"
      description="Automating fulfillment centers with robotics, WMS, and intelligent inventory tracking."
      icon={Box}
      stats={[
        { label: "Facilities", value: "50+" },
        { label: "WMS Impl", value: "Manhattan" },
        { label: "Robotics", value: "Integration" },
        { label: "Accuracy", value: "99.9%" }
      ]}
      challenges={[
        {
          title: "Labor Shortages",
          description: "Mitigating workforce volatility through automation and efficiency tools."
        },
        {
          title: "Real-Time Inventory",
          description: "Maintaining perfect synchronization between physical stock and digital records."
        }
      ]}
      solutions={[
        {
          title: "WMS Implementation",
          description: "Deploying and customizing Tier 1 Warehouse Management Systems."
        },
        {
          title: "Automation Integration",
          description: "Connecting WMS with conveyor systems, sorters, and AMRs."
        }
      ]}
    />
  );
}


