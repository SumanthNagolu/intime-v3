import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Cpu } from 'lucide-react';

export default function TechnologyPage() {
  return (
    <IndustryTemplate
      title="Information Technology"
      description="From legacy modernization to cutting-edge AI implementation, we provide the specialized engineering talent that powers digital transformation."
      icon={Cpu}
      stats={[
        { label: "Placements", value: "200+" },
        { label: "Technologies", value: "50+" },
        { label: "Retention", value: "94%" },
        { label: "Avg Speed", value: "48h" }
      ]}
      challenges={[
        {
          title: "Rapid Obsolescence",
          description: "Skills that are relevant today may be obsolete in 18 months. Finding adaptable talent is critical."
        },
        {
          title: "The Seniority Gap",
          description: "There is a massive shortage of true senior engineers who can architect systems, not just write code."
        }
      ]}
      solutions={[
        {
          title: "Skill-Specific Vetting",
          description: "We don't just check for 'Java'. We check for 'Java 17 with Spring Boot and Microservices architecture experience'."
        },
        {
          title: "Simulation-Based Training",
          description: "Our candidates have already built enterprise-grade systems in our academy before they touch your codebase."
        }
      ]}
    />
  );
}


