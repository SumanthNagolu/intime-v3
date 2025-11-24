import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { ShoppingBag } from 'lucide-react';

export default function RetailPage() {
  return (
    <IndustryTemplate
      title="Retail & E-Commerce"
      description="Bridging the gap between brick-and-mortar and digital commerce with unified retail platforms."
      icon={ShoppingBag}
      stats={[
        { label: "Retailers", value: "30+" },
        { label: "E-Com Platforms", value: "SFCC/Shopify" },
        { label: "Black Friday", value: "100% Uptime" },
        { label: "POS Integration", value: "Seamless" }
      ]}
      challenges={[
        {
          title: "Scalability",
          description: "Handling massive traffic spikes during holiday seasons without performance degradation."
        },
        {
          title: "Personalization",
          description: "Delivering tailored product recommendations in real-time based on user behavior."
        }
      ]}
      solutions={[
        {
          title: "Headless Commerce",
          description: "Decoupling front-end experiences from back-end logic for maximum flexibility."
        },
        {
          title: "Order Management (OMS)",
          description: "Implementing robust OMS to handle complex fulfillment scenarios (BOPIS, Ship-from-Store)."
        }
      ]}
    />
  );
}


