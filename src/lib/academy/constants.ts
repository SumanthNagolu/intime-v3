/**
 * Academy UI Constants & Mock Data
 * Exact copy from academy prototype app
 *
 * This will be replaced with real Supabase data later
 */

import {
  AcademyModule,
  AcademyPersona,
  AcademyBlueprintItem,
  AcademyInterviewScriptLine,
  AcademyCohortActivity
} from '@/types/academy';

export const SENIOR_PERSONA: AcademyPersona = {
  name: "Priya Sharma",
  title: "Senior Guidewire Developer",
  experienceLevel: "7 Years",
  image: "P",
  skills: ["PolicyCenter", "Gosu", "Edge APIs", "Integration Patterns", "Rating Engines"],
  companies: [
    {
      name: "TechFlow Insurance",
      role: "Lead Developer",
      duration: "2021 - Present",
      description: "Led the migration of PolicyCenter 8 to 10. Architected the new Reinsurance integration layer using REST APIs."
    },
    {
      name: "Global Insure Corp",
      role: "Guidewire Configuration Specialist",
      duration: "2018 - 2021",
      description: "Implemented Personal Auto LOB from scratch. Optimized rating engine performance by 40%."
    }
  ]
};

export const BLUEPRINT_ITEMS: AcademyBlueprintItem[] = [
  {
    id: "US-101",
    title: "Configure Submission Workflow",
    status: 'completed',
    moduleRef: 1,
    description: "As an Underwriter, I need a streamlined submission wizard to reduce quote time.",
    deliverables: ["JobWizard configuration", "UI PCF files"]
  },
  {
    id: "US-104",
    title: "Implement Vehicle Entity",
    status: 'completed',
    moduleRef: 3,
    description: "Extend the Data Model to support Commercial Vehicles with specific VIN validation logic.",
    deliverables: ["Data Dictionary Extension", "Entity Verification"]
  },
  {
    id: "US-105",
    title: "Medical Payments Coverage",
    status: 'in_progress',
    moduleRef: 3,
    description: "Add Electable coverage for MedPay with variable limits based on state jurisdiction.",
    deliverables: ["Coverage Pattern XML", "Product Model Sync"]
  }
];

export const INTERVIEW_SCRIPT: AcademyInterviewScriptLine[] = [
  { speaker: 'Interviewer', text: "Can you walk me through how you handled complex integrations in your last project?", duration: 4000 },
  { speaker: 'SeniorDev', text: "Absolutely. At TechFlow, we had a legacy billing system that needed real-time policy updates.", duration: 5000 },
  { speaker: 'SeniorDev', text: "I architected a solution using the Cloud API (REST) instead of the older SOAP plugins to ensure scalability.", duration: 6000 },
  { speaker: 'Interviewer', text: "Why did you choose REST over SOAP for that specific use case?", duration: 3000 },
  { speaker: 'SeniorDev', text: "Great question. The legacy system had limited SOAP support, and we wanted to minimize the XML parsing overhead. JSON payloads reduced our latency by about 200ms per transaction.", duration: 8000 },
];

export const COHORT_ACTIVITY: AcademyCohortActivity[] = [
  { user: "Sarah J.", action: "deployed Module 3 Lab", time: "2m ago", type: "lab" },
  { user: "Mike T.", action: "passed Rules Engine Quiz", time: "5m ago", type: "quiz" },
  { user: "David L.", action: "unlocked Blueprint v1.0", time: "12m ago", type: "milestone" },
  { user: "Priya P.", action: "started Interview Shadowing", time: "15m ago", type: "practice" },
];

export const MOCK_MODULES: AcademyModule[] = [
  {
    id: 1,
    title: "Foundation & Architecture",
    description: "Master the core P&C insurance concepts and Guidewire architecture.",
    progress: 100,
    week: "Week 1",
    lessons: [
      {
        id: 'm1-l1',
        title: "The Insurance Ecosystem",
        status: 'completed',
        duration: "45 min",
        type: "standard",
        content: {
          theory: { slides: ["Intro to P&C", "The Policy Lifecycle", "Carriers vs Brokers"], duration: "15 min" },
          demo: { videoUrl: "", duration: "20 min" },
          quiz: { questions: [], passingScore: 80 },
          lab: { title: "Ecosystem Mapping", instructions: "Map the entities.", userStoryId: "US-100" }
        }
      }
    ]
  },
  {
    id: 3,
    title: "Data Modeling & Architecture",
    description: "The backbone of the system. Learn how data is structured and stored.",
    progress: 65,
    week: "Week 3",
    lessons: [
      {
        id: 'l2',
        title: "Entity Creation & Extension",
        status: 'completed',
        duration: "60 min",
        type: "standard",
        content: {
          theory: { slides: ["Data Model Overview", "ETI vs ETX Files", "DB Consistency Checks"], duration: "20 min" },
          demo: { videoUrl: "", duration: "30 min" },
          quiz: { questions: [], passingScore: 80 },
          lab: { title: "Vehicle Entity Lab", instructions: "Create the Vehicle entity.", userStoryId: "US-104" }
        }
      },
      {
        id: 'l3',
        title: "Configuration Lab: Coverages",
        status: 'current',
        duration: "90 min",
        type: "lab",
        content: {
          theory: {
            slides: [
              {
                title: "Coverage Patterns 101",
                bullets: ["Definition of Coverage Pattern", "Public ID naming conventions", "Linking to PolicyLines"],
                context: "In older versions (v7/v8), this was done purely in XML. Now we have the Product Designer, but you MUST understand the XML structure to debug deployment errors."
              },
              {
                title: "The Product Model Hierarchy",
                bullets: ["Product -> PolicyLine -> ClausePattern", "Availability Scripts", "Grandfathering logic"],
                context: "Availability Logic is where 80% of bugs happen. 'Why can't I see this coverage in the UI?' is the most common ticket you will solve."
              },
              {
                title: "CovTerms: Direct vs Option",
                bullets: ["Direct: User enters a number", "Option: User picks from dropdown", "Typekey verification"],
                context: "Always prefer Option terms for data integrity. Direct terms allow messy data into the system which breaks Rating engines later."
              }
            ],
            duration: "25 min"
          },
          demo: {
            videoUrl: "mock_url",
            duration: "35 min",
            transcript: "In this demo, we will navigate to the Product Designer. Notice how the hierarchy flows from Product -> Policy Line -> Coverage Pattern... When I click 'Reload', watch the server logs. That 'ProductModelReload' event is critical."
          },
          quiz: {
            passingScore: 100,
            questions: [
              {
                id: 'q1',
                question: "Where is the 'existence' logic for a coverage defined?",
                correctOptionId: 'o2',
                explanation: "Existence logic (Electable, Required, Suggested) is defined in the Coverage Pattern XML.",
                options: [
                  { id: 'o1', text: "In the Gosu Rules" },
                  { id: 'o2', text: "In the Coverage Pattern XML" },
                  { id: 'o3', text: "In the UI PCF file" },
                  { id: 'o4', text: "In the Database Schema" }
                ]
              }
            ]
          },
          lab: {
            title: "Implement MedPay Coverage",
            userStoryId: "US-105",
            instructions: "Navigate to coverage-config.xml. Define a new CoveragePattern with public-id 'PAMedPayCov'. Set priority to 20. Ensure the existence type is 'Electable'.",
            codeSnippet: `<CoveragePattern
  public-id="PAMedPayCov"
  coverageCategory="PAPip"
  priority="20"
  existence="Electable"
  owningEntityType="PersonalVehicle">
  <CovTerms>
    <OptionCovTerm patternCode="Limit" ... />
  </CovTerms>
</CoveragePattern>`
          }
        }
      }
    ]
  }
];
