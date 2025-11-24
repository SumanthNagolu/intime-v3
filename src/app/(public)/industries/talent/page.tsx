import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Sparkles } from 'lucide-react';

export default function TalentPage() {
  return (
    <IndustryTemplate
      title="Talent & Recruiting"
      description="Powering the staffing industry itself with recruitment marketing and ATS technology."
      icon={Sparkles}
      stats={[
        { label: "Agencies", value: "50+" },
        { label: "ATS Intg", value: "Bullhorn" },
        { label: "AI Sourcing", value: "Active" },
        { label: "Placements", value: "Faster" }
      ]}
      challenges={[
        {
          title: "Candidate Experience",
          description: "Reducing friction in the application process to minimize drop-off."
        },
        {
          title: "Speed to Hire",
          description: "Automating screening and scheduling to secure top talent first."
        }
      ]}
      solutions={[
        {
          title: "Recruitment Marketing",
          description: "Programmatic job advertising and career site optimization."
        },
        {
          title: "ATS Configuration",
          description: "Customizing Bullhorn, JobDiva, and Greenhouse workflows."
        }
      ]}
    />
  );
}


