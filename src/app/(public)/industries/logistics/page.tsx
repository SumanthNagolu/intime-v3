import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Container } from 'lucide-react';

export default function LogisticsPage() {
  return (
    <IndustryTemplate
      title="Logistics & Transportation"
      description="Optimizing the global supply chain with real-time tracking, fleet management, and predictive analytics."
      icon={Container}
      stats={[
        { label: "Carriers", value: "10+" },
        { label: "Assets Tracked", value: "50k+" },
        { label: "Route Opt", value: "AI-Driven" },
        { label: "Efficiency", value: "+30%" }
      ]}
      challenges={[
        {
          title: "Last Mile Complexity",
          description: "Solving the traveling salesman problem at scale with dynamic constraints."
        },
        {
          title: "Visibility",
          description: "Providing real-time transparency to customers across fragmented carrier networks."
        }
      ]}
      solutions={[
        {
          title: "IoT Integration",
          description: "Connecting telematics devices to central cloud platforms for real-time fleet monitoring."
        },
        {
          title: "Route Optimization",
          description: "Algorithms and operations research expertise to minimize fuel and time."
        }
      ]}
    />
  );
}


