import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { BadgeDollarSign } from 'lucide-react';

export default function FinancePage() {
  return (
    <IndustryTemplate
      title="Financial Services"
      description="Powering the future of fintech, banking, and insurance with secure, high-performance engineering talent."
      icon={BadgeDollarSign}
      stats={[
        { label: "Fintech Clients", value: "30+" },
        { label: "Banks Served", value: "12" },
        { label: "Guidewire Pros", value: "100+" },
        { label: "Security Score", value: "A+" }
      ]}
      challenges={[
        {
          title: "Security & Latency",
          description: "Financial systems require zero-tolerance for security flaws and microsecond latency performance."
        },
        {
          title: "Legacy Mainframe Integration",
          description: "Bridging COBOL cores with React frontends is a specialized skill set that is hard to find."
        }
      ]}
      solutions={[
        {
          title: "Guidewire Expertise",
          description: "We are the premier supplier of Guidewire PolicyCenter and ClaimCenter developers."
        },
        {
          title: "Security-Centric Training",
          description: "Our academy curriculum emphasizes OWASP Top 10 and secure coding standards from Day 1."
        }
      ]}
    />
  );
}


