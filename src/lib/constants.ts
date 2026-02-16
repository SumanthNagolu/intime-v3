import { Module, Persona, BlueprintItem, InterviewScriptLine } from './types';

export const SENIOR_PERSONA: Persona = {
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

export const BLUEPRINT_ITEMS: BlueprintItem[] = [
  {
    id: "US-101",
    title: "Configure Submission Workflow",
    status: 'completed',
    moduleRef: 5,
    description: "As an Underwriter, I need a streamlined submission wizard to reduce quote time.",
    deliverables: ["JobWizard configuration", "UI PCF files"]
  },
  {
    id: "US-104",
    title: "Implement Vehicle Entity",
    status: 'completed',
    moduleRef: 5,
    description: "Extend the Data Model to support Commercial Vehicles with specific VIN validation logic.",
    deliverables: ["Data Dictionary Extension", "Entity Verification"]
  },
  {
    id: "US-105",
    title: "Medical Payments Coverage",
    status: 'in_progress',
    moduleRef: 5,
    description: "Add Electable coverage for MedPay with variable limits based on state jurisdiction.",
    deliverables: ["Coverage Pattern XML", "Product Model Sync"]
  },
  {
    id: "US-201",
    title: "Rating Engine Logic",
    status: 'pending',
    moduleRef: 7,
    description: "Implement rate routines for Base Premium calculation based on territory codes.",
    deliverables: ["Rate Table Definition", "Gosu Rate Routine"]
  }
];

export const INTERVIEW_SCRIPT: InterviewScriptLine[] = [
  { speaker: 'Interviewer', text: "Can you walk me through how you handled complex integrations in your last project?", duration: 4000 },
  { speaker: 'SeniorDev', text: "Absolutely. At TechFlow, we had a legacy billing system that needed real-time policy updates.", duration: 5000 },
  { speaker: 'SeniorDev', text: "I architected a solution using the Cloud API (REST) instead of the older SOAP plugins to ensure scalability.", duration: 6000 },
  { speaker: 'Interviewer', text: "Why did you choose REST over SOAP for that specific use case?", duration: 3000 },
  { speaker: 'SeniorDev', text: "Great question. The legacy system had limited SOAP support, and we wanted to minimize the XML parsing overhead. JSON payloads reduced our latency by about 200ms per transaction.", duration: 8000 },
];

export const COHORT_ACTIVITY = [
  { user: "Sarah J.", action: "deployed Module 5 Lab", time: "2m ago", type: "lab" },
  { user: "Mike T.", action: "passed Gosu Certification", time: "5m ago", type: "quiz" },
  { user: "David L.", action: "unlocked Module 7", time: "12m ago", type: "milestone" },
  { user: "Priya P.", action: "started Interview Shadowing", time: "15m ago", type: "practice" },
];

// Guidewire Curriculum Map:
// 1. InsuranceSuite Introduction (Mandatory)
// 3. PolicyCenter Introduction
// 5. InsuranceSuite Configuration Fundamentals (Mandatory)
// 7. PolicyCenter Configuration
// 9. InsuranceSuite Integration Developer

export const MOCK_MODULES: Module[] = [
  {
    id: 1,
    title: "InsuranceSuite Introduction",
    description: "Mandatory Foundation. Understand the core architecture, the interaction between Policy, Billing, and Claims, and the user interface.",
    progress: 100,
    week: "Week 1",
    lessons: [
      { 
        id: 'm1-l1', title: "Suite Architecture & Technology Stack", status: 'completed', duration: "45 min", type: "standard",
        content: { theory: { slides: ["Java & Gosu", "The database layer", "Web Server config"], duration: "15 min" }, demo: { videoUrl: "", duration: "20 min" }, quiz: { questions: [], passingScore: 80 }, lab: { title: "Intro Lab", instructions: "Explore.", userStoryId: "US-001" } }
      },
      { id: 'm1-l2', title: "User Interface Overview", status: 'completed', duration: "30 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm1-l3', title: "The Application Logic", status: 'completed', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } }
    ]
  },
  {
    id: 3,
    title: "PolicyCenter Introduction",
    description: "Specialization Track. Deep dive into the Policy lifecycle, transactions (Jobs), and the Product Model concepts.",
    progress: 100,
    week: "Week 2",
    lessons: [
      { id: 'm3-l1', title: "Policy Transactions (Jobs)", status: 'completed', duration: "50 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm3-l2', title: "The Product Model Intro", status: 'completed', duration: "45 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm3-l3', title: "Account Management", status: 'completed', duration: "30 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } }
    ]
  },
  {
    id: 5,
    title: "InsuranceSuite Configuration Fundamentals",
    description: "Mandatory Core. The heavy lifting. Master the Data Model, PCF configuration, and Gosu business logic.",
    progress: 35,
    week: "Week 3-4",
    lessons: [
      { 
        id: 'm5-l1', 
        title: "Data Model: Entities & Typelists", 
        status: 'completed',
        duration: "60 min",
        type: "standard",
        content: {
          theory: { slides: ["Data Dictionary", "ETI vs ETX", "Typelist Filters"], duration: "20 min" },
          demo: { videoUrl: "", duration: "30 min" },
          quiz: { questions: [], passingScore: 80 },
          lab: { title: "Vehicle Entity", instructions: "Create the Vehicle entity.", userStoryId: "US-104" }
        }
      },
      { 
        id: 'm5-l2', 
        title: "PCF Files: Locations & Navigation", 
        status: 'completed',
        duration: "75 min",
        type: "standard",
        content: {
          theory: { slides: ["LocationGroups", "Page Structure", "Navigation Graph"], duration: "25 min" },
          demo: { videoUrl: "", duration: "30 min" },
          quiz: { questions: [], passingScore: 80 },
          lab: { title: "Wizard Navigation", instructions: "Config steps.", userStoryId: "US-101" }
        }
      },
      { 
        id: 'm5-l3', 
        title: "Configuration Lab: Coverage Logic", 
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
      },
      { id: 'm5-l4', title: "Introduction to Gosu", status: 'locked', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm5-l5', title: "Gosu Queries & Database Access", status: 'locked', duration: "90 min", type: "lab", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm5-l6', title: "PCF Input Sets & Detail Views", status: 'locked', duration: "45 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm5-l7', title: "Display Keys & Localization", status: 'locked', duration: "30 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm5-l8', title: "Rule Sets (Pre-Update, Validation)", status: 'locked', duration: "60 min", type: "lab", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } }
    ]
  },
  {
    id: 7,
    title: "PolicyCenter Configuration",
    description: "Advanced Specialization. Complex Line of Business logic, Rating Engines, Form Inference, and Underwriting Authority.",
    progress: 0,
    week: "Week 5-8",
    lessons: [
      { id: 'm7-l1', title: "Advanced Product Model", status: 'locked', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm7-l2', title: "Rating Management", status: 'locked', duration: "90 min", type: "lab", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm7-l3', title: "Form Inference Logic", status: 'locked', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm7-l4', title: "Underwriting Issues & Blocking", status: 'locked', duration: "45 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm7-l5', title: "Job Process Customization", status: 'locked', duration: "120 min", type: "lab", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } }
    ]
  },
  {
    id: 9,
    title: "InsuranceSuite Integration Developer",
    description: "Architect Level. Connecting Guidewire to the world via Cloud API, Plugins, Messaging, and Batch Processes.",
    progress: 0,
    week: "Week 9-12",
    lessons: [
      { id: 'm9-l1', title: "Integration Patterns Overview", status: 'locked', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm9-l2', title: "Cloud API (REST) Fundamentals", status: 'locked', duration: "90 min", type: "lab", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm9-l3', title: "Messaging & Event Firing", status: 'locked', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm9-l4', title: "Batch Processes & Work Queues", status: 'locked', duration: "60 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } },
      { id: 'm9-l5', title: "Authentication & Security", status: 'locked', duration: "45 min", type: "standard", content: { theory: { slides: [], duration: "0" }, demo: { videoUrl: "", duration: "0" }, quiz: { questions: [], passingScore: 0 }, lab: { title: "", instructions: "", userStoryId: "" } } }
    ]
  }
];
