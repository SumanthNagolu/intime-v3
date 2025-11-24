import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { Users } from 'lucide-react';

export default function HRPage() {
  return (
    <IndustryTemplate
      title="Human Resources"
      description="Transforming the employee lifecycle with modern HRIS, payroll, and talent management systems."
      icon={Users}
      stats={[
        { label: "HRIS Impl", value: "Workday" },
        { label: "Payroll", value: "ADP/UKG" },
        { label: "Employees", value: "Managed" },
        { label: "Compliance", value: "Global" }
      ]}
      challenges={[
        {
          title: "System Fragmentation",
          description: "Employee data is often scattered across payroll, benefits, and performance systems."
        },
        {
          title: "Remote Work",
          description: "Managing compliance, tax, and engagement for a distributed workforce."
        }
      ]}
      solutions={[
        {
          title: "HCM Implementation",
          description: "Full-lifecycle implementation of Workday, Oracle HCM, and SAP SuccessFactors."
        },
        {
          title: "People Analytics",
          description: "Dashboards to track retention, engagement, and diversity metrics."
        }
      ]}
    />
  );
}


