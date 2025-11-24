import IndustryTemplate from '@/components/marketing/IndustryTemplate';
import { BrainCircuit } from 'lucide-react';

export default function AIDataPage() {
  return (
    <IndustryTemplate
      title="AI/ML & Data Science"
      description="Turning raw data into predictive insights and intelligent automation."
      icon={BrainCircuit}
      stats={[
        { label: "Data Scientists", value: "50+" },
        { label: "Models Deployed", value: "200+" },
        { label: "Big Data", value: "Petabytes" },
        { label: "Platforms", value: "Databricks" }
      ]}
      challenges={[
        {
          title: "Data Quality",
          description: "Garbage in, garbage out. Cleaning and governing data at scale is the primary bottleneck."
        },
        {
          title: "Model Operationalization",
          description: "Moving models from Jupyter notebooks to production APIs (MLOps)."
        }
      ]}
      solutions={[
        {
          title: "Data Engineering",
          description: "Building robust pipelines (ETL/ELT) using Spark, Airflow, and DBT."
        },
        {
          title: "Generative AI",
          description: "Implementing LLMs for internal knowledge management and customer support."
        }
      ]}
    />
  );
}


