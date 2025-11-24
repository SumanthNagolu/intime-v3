# HR/Employee Portal - Frontend Build Specification

**For:** Frontend Developer (standalone context)
**Project:** InTime v3 HR Management System (PeopleOS)
**Current Status:** 70% complete (frontend only)
**Goal:** Complete remaining 30% for full demo-ready experience
**Code Location:** `/frontend-prototype/`
**Live Preview:** `http://localhost:3004`

---

## 🎯 What is the HR/Employee Portal?

### Business Context

InTime's HR Portal (internally called "PeopleOS") is a complete **Human Capital Management system** for staffing companies managing consultants, employees, and training programs.

**The Problem:**
- Staffing companies juggle consultants, clients, projects, training, payroll
- Traditional HR systems don't understand the staffing business model
- Consultants need self-service access to assignments, timesheets, benefits
- HR teams need compliance, training management, performance tracking

**The Solution:**
- Unified employee/consultant management
- Training academy integration (course assignment)
- Time & attendance tracking
- Performance reviews and compensation management
- Self-service employee portal
- Real-time org chart visualization
- Document management and compliance

**Business Model:**
- Internal tool for InTime's 50-200 employees/consultants
- Future B2B SaaS offering for other staffing companies
- Pricing: $15-25/employee/month (projected)

---

## 👥 User Personas

### 1. **HR Manager / People Ops** (Primary User)
- Age: 28-45
- Role: Manages entire employee lifecycle
- Goals:
  - Assign training to employees
  - Track performance and compensation
  - Ensure compliance (documents, certifications)
  - Monitor time & attendance
  - Manage recruitment pipeline
- Pain: Too many disconnected tools (HRIS, LMS, ATS, payroll)
- Portal: `/hr/*` (all admin pages)

### 2. **Employee** (Secondary User)
- Age: 22-55
- Role: Full-time employee (sales, recruiting, admin, etc.)
- Goals:
  - View assigned training courses
  - Submit timesheets
  - Check PTO balance
  - Download pay stubs and tax documents
  - Update emergency contacts
- Pain: HR requests take days, no self-service
- Portal: `/employee/*` (self-service pages)

### 3. **Consultant** (Secondary User)
- Age: 25-40
- Role: Bench consultant between client assignments
- Goals:
  - Complete assigned upskilling courses
  - Track billable hours
  - View assignment history
  - Access benefits info
- Pain: Stuck "on the bench" without productive work
- Portal: `/bench/*` (consultant-specific pages)

### 4. **Manager** (Tertiary User)
- Age: 30-50
- Role: Team lead, department head
- Goals:
  - Approve team timesheets
  - Conduct performance reviews
  - View team training completion
  - Manage direct reports
- Pain: No visibility into team progress
- Portal: `/hr/people` (filtered to direct reports)

---

## 🏢 The HR Portal Modules

### Module 1: Learning & Development (L&D)
**Purpose:** Assign and track employee training

**Location:** `/hr/learning`

**Use Cases:**
- HR assigns Guidewire course to 5 new hires
- Track completion rates across company
- Issue certifications upon course completion
- Monitor training compliance (e.g., annual security training)

**Current Status:** 🟡 70% complete
- ✅ Course catalog displays
- ✅ Stats cards (completion rate, active learners)
- 🔴 **"Assign to Employee" button broken** (critical)
- ❌ No employee progress dashboard
- ❌ No completion tracking UI

---

### Module 2: People Directory
**Purpose:** Employee roster with profiles and search

**Location:** `/hr/people`

**Use Cases:**
- Search for employee by name, department, skill
- View employee profile (contact, role, manager)
- Filter by status (active, on leave, terminated)
- Export employee list to CSV

**Current Status:** ❓ Unknown
- Likely implemented based on routing
- Needs testing to verify

---

### Module 3: Organization Chart
**Purpose:** Visual company hierarchy

**Location:** `/hr/org`

**Use Cases:**
- View reporting structure
- Identify department heads
- Plan reorganizations
- Onboard new employees (show who's who)

**Current Status:** ❓ Unknown

---

### Module 4: Time & Attendance
**Purpose:** Timesheet submission and approval

**Location:** `/hr/time`

**Use Cases:**
- Employees submit weekly timesheets
- Managers approve/reject timesheets
- Track PTO requests and balances
- Export for payroll processing
- Monitor overtime and compliance

**Current Status:** ❓ Unknown

---

### Module 5: Compensation & Payroll
**Purpose:** Salary, bonuses, pay stubs

**Location:** `/hr/payroll`

**Use Cases:**
- View salary history
- Process annual raises
- Download pay stubs
- Manage commission structures (for sales team)
- Track equity/stock options

**Current Status:** ❓ Unknown

---

### Module 6: Performance Reviews
**Purpose:** 360 reviews and goal tracking

**Location:** `/hr/performance`

**Use Cases:**
- Conduct quarterly/annual reviews
- Set and track OKRs/goals
- Peer feedback collection
- Promotion recommendations
- Performance improvement plans (PIPs)

**Current Status:** ❓ Unknown

---

### Module 7: Recruitment & Onboarding
**Purpose:** Hiring pipeline and new hire onboarding

**Location:** `/hr/recruitment`

**Use Cases:**
- Post job openings
- Track candidates through pipeline
- Schedule interviews
- Extend offers
- Onboarding checklist for new hires
- I-9 and background check tracking

**Current Status:** ❓ Unknown

---

### Module 8: Documents & Compliance
**Purpose:** Employee handbook, policies, certifications

**Location:** `/hr/documents`

**Use Cases:**
- Store employee handbook
- Track signed acknowledgments (harassment training, code of conduct)
- Manage certifications (Guidewire certs, security clearances)
- I-9 and visa documentation
- COBRA and benefits enrollment forms

**Current Status:** ❓ Unknown

---

### Module 9: Analytics & Reporting
**Purpose:** HR metrics and dashboards

**Location:** `/hr/analytics`

**Use Cases:**
- Headcount trends
- Attrition rate
- Training completion rate
- Time-to-hire
- Diversity metrics
- Cost-per-hire

**Current Status:** ❓ Unknown

---

## 🔄 Complete User Flows

### **Flow 1: HR Manager Assigns Training Course**

```
CURRENT STATE (Broken):

1. HR Manager navigates to /hr/learning ✅
2. Sees course catalog with 5 courses ✅
3. Clicks "Assign to Employee" button ✅
4. Button changes to active state (orange) ✅
5. NOTHING HAPPENS ❌ (should open modal)

EXPECTED STATE:

1. HR Manager navigates to /hr/learning ✅
2. Sees course catalog with 5 courses ✅
3. Clicks "Assign to Employee" button ✅
4. Modal opens: "Assign Course to Employees" ❌ MISSING
   ┌─────────────────────────────────────────┐
   │ Assign Course                           │
   │ InsuranceSuite Configuration            │
   ├─────────────────────────────────────────┤
   │                                         │
   │ Select Employees:                       │
   │ ┌─────────────────────────────────┐   │
   │ │ 🔍 Search by name, department... │   │
   │ └─────────────────────────────────┘   │
   │                                         │
   │ ☐ Alex Johnson (Engineering)           │
   │ ☑ Maria Garcia (Sales)                 │
   │ ☑ John Smith (Engineering)             │
   │ ☐ Sarah Chen (Product)                 │
   │ ☐ Mike Wilson (Recruiting)             │
   │                                         │
   │ Show: [All] [Engineering▼] [Active▼]  │
   │                                         │
   │ Start Date:                             │
   │ [📅 Dec 1, 2025 ▼]                     │
   │                                         │
   │ Due Date (Optional):                    │
   │ [📅 Dec 31, 2025 ▼]                    │
   │                                         │
   │ Priority:                               │
   │ ( ) Optional  (•) Recommended  ( ) Mandatory │
   │                                         │
   │ Message (Optional):                     │
   │ ┌─────────────────────────────────┐   │
   │ │ Hi team, please complete this   │   │
   │ │ training by year-end for our    │   │
   │ │ upcoming project...             │   │
   │ └─────────────────────────────────┘   │
   │                                         │
   │ [Cancel] [Assign Course to 2 Employees]│
   └─────────────────────────────────────────┘

5. HR selects employees (multi-select checkboxes) ❌
6. Sets start date and due date ❌
7. Chooses priority level ❌
8. Adds optional message ❌
9. Clicks "Assign Course to X Employees" ❌
   ↓
10. Loading state shown ❌
    ↓
11. Success notification appears ❌
    "✅ Course assigned to 2 employees. They will receive email notifications."
    ↓
12. Modal closes ❌
    ↓
13. Course card updates enrollment count ❌
    "14 employees enrolled" (was 12)
    ↓
14. [BACKEND] Email sent to employees: ❌
    ```
    Subject: New Training Assignment - InsuranceSuite Configuration

    Hi Maria,

    You've been assigned to complete:
    InsuranceSuite Configuration Fundamentals

    Start Date: Dec 1, 2025
    Due Date: Dec 31, 2025
    Priority: Recommended

    Message from HR:
    "Hi team, please complete this training by year-end..."

    [Start Training] button

    Questions? Contact hr@intime.com
    ```
    ↓
15. [BACKEND] Employee can now access course in their portal ❌
```

**Current Completion:** 30% (UI exists, no functionality)
**Blocker:** "Assign to Employee" button does nothing

---

### **Flow 2: Employee Views Assigned Training**

```
EXPECTED STATE (Not tested):

1. Employee logs into /employee/dashboard ❓
   ↓
2. Sees "My Training" section ❓
   ┌─────────────────────────────────────┐
   │ My Assigned Training                │
   ├─────────────────────────────────────┤
   │ 🔴 InsuranceSuite Config (DUE 12/31)│
   │    Status: Not Started              │
   │    Priority: Recommended            │
   │    [Start Now]                      │
   │                                     │
   │ 🟡 Security Awareness (IN PROGRESS) │
   │    Status: 60% Complete             │
   │    Priority: Mandatory              │
   │    [Continue]                       │
   │                                     │
   │ ✅ Onboarding Complete              │
   │    Completed: Nov 15, 2025          │
   │    Score: 95%                       │
   │    [View Certificate]               │
   └─────────────────────────────────────┘
   ↓
3. Clicks "Start Now" on assigned course ❓
   ↓
4. Redirected to /academy/dashboard (student portal) ❓
   ↓
5. Course appears in "Today's Focus" ❓
   ↓
6. Employee completes course ❓
   ↓
7. HR sees updated progress in /hr/learning ❓
```

**Current Completion:** Unknown (needs testing)

---

### **Flow 3: HR Tracks Training Compliance**

```
EXPECTED STATE (Not implemented):

1. HR navigates to /hr/learning ✅
   ↓
2. Clicks "View Progress Dashboard" tab/button ❌ MISSING
   ↓
3. Sees training compliance dashboard ❌
   ┌─────────────────────────────────────────────┐
   │ Training Compliance Dashboard               │
   ├─────────────────────────────────────────────┤
   │                                             │
   │ Overall Completion: 87% [Progress Bar]     │
   │ Active Learners: 12/50 employees           │
   │ Overdue Assignments: 3                      │
   │                                             │
   │ Filter: [All Courses▼] [All Depts▼]       │
   │                                             │
   │ ┌─────────────────────────────────────┐   │
   │ │ InsuranceSuite Config               │   │
   │ │ 14 assigned | 8 complete | 6 active │   │
   │ │ [View Details]                      │   │
   │ └─────────────────────────────────────┘   │
   │                                             │
   │ ┌─────────────────────────────────────┐   │
   │ │ Security Awareness (Mandatory)      │   │
   │ │ 50 assigned | 47 complete | 3 overdue│  │
   │ │ ⚠️ 3 employees past deadline         │   │
   │ │ [Send Reminder]                     │   │
   │ └─────────────────────────────────────┘   │
   │                                             │
   │ Employee Progress:                          │
   │ ┌───────────────────────────────────┐     │
   │ │ Name          | Course    | Status│     │
   │ ├───────────────────────────────────┤     │
   │ │ Alex Johnson  | InsurS... | 100% ✅│    │
   │ │ Maria Garcia  | InsurS... | 35% 🟡│     │
   │ │ John Smith    | InsurS... | 0% ⏸️ │     │
   │ │ Sarah Chen    | SecurA... | OVERDUE🔴│  │
   │ └───────────────────────────────────┘     │
   │                                             │
   │ [Export Report] [Send Reminders]           │
   └─────────────────────────────────────────────┘
   ↓
4. HR clicks "Send Reminder" for overdue employees ❌
   ↓
5. Bulk email sent to 3 overdue employees ❌
   ↓
6. HR exports compliance report to CSV ❌
```

**Current Completion:** 0% (not implemented)

---

### **Flow 4: Manager Approves Team Timesheet**

```
EXPECTED STATE (Not implemented):

1. Manager navigates to /hr/time ❓
   ↓
2. Sees pending timesheets from direct reports ❓
   ┌─────────────────────────────────────┐
   │ Pending Approvals (5)               │
   ├─────────────────────────────────────┤
   │ Week of Nov 20-26, 2025             │
   │                                     │
   │ ☐ Alex Johnson - 40.0 hrs          │
   │    Mon-Fri: 8hrs each               │
   │    [View Details] [Approve] [Reject]│
   │                                     │
   │ ☐ Maria Garcia - 45.5 hrs           │
   │    Mon-Fri: 8hrs + Sat: 5.5 OT     │
   │    ⚠️ Overtime requires approval    │
   │    [View Details] [Approve] [Reject]│
   │                                     │
   │ [Select All] [Bulk Approve]        │
   └─────────────────────────────────────┘
   ↓
3. Manager clicks "View Details" ❓
   ↓
4. Modal shows daily breakdown ❓
   ┌─────────────────────────────────────┐
   │ Alex Johnson - Week of Nov 20      │
   ├─────────────────────────────────────┤
   │ Mon 11/20: 8.0 hrs                  │
   │   Project A: 6.0 hrs                │
   │   Admin: 2.0 hrs                    │
   │                                     │
   │ Tue 11/21: 8.0 hrs                  │
   │   Project A: 8.0 hrs                │
   │                                     │
   │ ... (rest of week)                  │
   │                                     │
   │ Total: 40.0 hrs                     │
   │ Billable: 30.0 hrs (75%)           │
   │                                     │
   │ Notes: "Completed Phase 1 of..."   │
   │                                     │
   │ [Approve] [Request Changes] [Reject]│
   └─────────────────────────────────────┘
   ↓
5. Manager approves timesheet ❓
   ↓
6. Timesheet marked approved ❓
   ↓
7. Payroll can now process ❓
```

**Current Completion:** Unknown

---

### **Flow 5: Employee Updates Profile**

```
EXPECTED STATE (Not implemented):

1. Employee navigates to /employee/profile ❓
   ↓
2. Sees editable profile fields ❓
   ┌─────────────────────────────────────┐
   │ My Profile                          │
   ├─────────────────────────────────────┤
   │ Personal Information                │
   │                                     │
   │ Full Name: Alex Johnson             │
   │ Email: alex@intime.com (read-only)  │
   │ Phone: [xxx-xxx-xxxx] [Edit]       │
   │ Address: [123 Main St...] [Edit]   │
   │                                     │
   │ Emergency Contact                   │
   │ Name: [Jane Johnson] [Edit]        │
   │ Relationship: [Spouse] [Edit]      │
   │ Phone: [xxx-xxx-xxxx] [Edit]       │
   │                                     │
   │ Bank Account (Direct Deposit)       │
   │ Account ending in ••••4567          │
   │ [Update Bank Info]                  │
   │                                     │
   │ Tax Withholding                     │
   │ W-4 Status: Married, 2 allowances  │
   │ [Update W-4]                        │
   │                                     │
   │ [Save Changes]                      │
   └─────────────────────────────────────┘
   ↓
3. Employee clicks [Edit] on phone ❓
   ↓
4. Field becomes editable ❓
   ↓
5. Employee updates phone number ❓
   ↓
6. Clicks "Save Changes" ❓
   ↓
7. Validation runs ❓
   ↓
8. Success message: "Profile updated" ❓
   ↓
9. [BACKEND] Audit log created ❓
   "Employee alex@intime.com updated phone number"
```

**Current Completion:** Unknown

---

## 📱 Screen-by-Screen Specifications

### **Screen 1: HR Dashboard (`/hr/dashboard`)**

**Purpose:** Executive overview of HR metrics

**Layout:**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  HR Dashboard                               │
│  Your people, at a glance.                  │
├─────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐         │
│  │ Headcount    │ │ Open Roles   │         │
│  │ 52           │ │ 8            │         │
│  │ +3 this mo.  │ │ 2 urgent     │         │
│  └──────────────┘ └──────────────┘         │
│                                             │
│  ┌──────────────┐ ┌──────────────┐         │
│  │ Attrition    │ │ Pending      │         │
│  │ 8.5%         │ │ Timesheets   │         │
│  │ Below target │ │ 12           │         │
│  └──────────────┘ └──────────────┘         │
│                                             │
│  Recent Activity:                           │
│  • 3 new hires started this week            │
│  • 5 employees due for review               │
│  • 2 certifications expiring soon           │
│                                             │
│  Quick Actions:                             │
│  [+ New Employee] [Post Job] [Run Report]  │
└─────────────────────────────────────────────┘
```

**Current Status:** ❓ Unknown (needs testing)

**What Needs to Be Built (If Missing):**
1. Stat cards with real-time counts
2. Trend indicators (up/down arrows)
3. Activity feed
4. Quick action buttons
5. Responsive grid layout

---

### **Screen 2: Learning Admin (`/hr/learning`) - PARTIALLY WORKING**

**Purpose:** Assign and track employee training

**Current Status:** 🟡 70% complete

**What's Working:**
✅ Page loads
✅ Stats cards display (Completion Rate, Active Learners, Certifications)
✅ Course catalog shows 5 courses
✅ Course cards with details
✅ "Assign to Employee" button exists

**What's Broken:**
🔴 "Assign to Employee" button does nothing

**What's Missing:**
❌ Employee progress dashboard
❌ Completion tracking table
❌ Filter/search courses
❌ Send reminder functionality
❌ Export reports

**Layout (Current):**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  GROWTH                                     │
│  Learning & Development                     │
│  Monitor training compliance and assign     │
│  coursework.                                │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ COMPLETION RATE                     │   │
│  │ 87%                                 │   │
│  │ [Progress bar]                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ACTIVE LEARNERS                     │   │
│  │ 12                                  │   │
│  │ Employees enrolled in at least 1... │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ CERTIFICATIONS ISSUED               │   │
│  │ 5                                   │   │
│  │ This Quarter                        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Course Catalog:                            │
│  ┌─────────────────────────────────────┐   │
│  │ 1. InsuranceSuite Introduction      │   │
│  │    Week 1 | 3 Lessons               │   │
│  │    [Assign to Employee] 🔴 BROKEN   │   │
│  └─────────────────────────────────────┘   │
│  ... (4 more courses)                       │
└─────────────────────────────────────────────┘
```

**Implementation Needed:**

**1. Fix "Assign to Employee" Button**

```typescript
// Current (broken):
<button onClick={() => {
  // Does nothing!
}}>
  Assign to Employee
</button>

// Needed:
const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

const handleAssignClick = (course: Course) => {
  setSelectedCourse(course);
  setShowAssignModal(true);
};

<button onClick={() => handleAssignClick(course)}>
  Assign to Employee
</button>

{showAssignModal && (
  <AssignCourseModal
    course={selectedCourse}
    onClose={() => setShowAssignModal(false)}
    onSubmit={handleAssignSubmit}
  />
)}
```

**2. Create AssignCourseModal Component**

```typescript
interface AssignCourseModalProps {
  course: Course;
  onClose: () => void;
  onSubmit: (data: AssignmentData) => void;
}

const AssignCourseModal: React.FC<AssignCourseModalProps> = ({
  course,
  onClose,
  onSubmit,
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<'optional' | 'recommended' | 'mandatory'>('recommended');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock employee data (replace with API call)
  const employees = [
    { id: '1', name: 'Alex Johnson', department: 'Engineering', status: 'active' },
    { id: '2', name: 'Maria Garcia', department: 'Sales', status: 'active' },
    { id: '3', name: 'John Smith', department: 'Engineering', status: 'active' },
    { id: '4', name: 'Sarah Chen', department: 'Product', status: 'active' },
  ];

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleEmployee = (employeeId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSubmit = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    onSubmit({
      courseId: course.id,
      employeeIds: selectedEmployees,
      startDate,
      dueDate,
      priority,
      message,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-2">Assign Course</h3>
        <p className="text-gray-600 mb-6">{course.title}</p>

        {/* Employee Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Select Employees:
          </label>
          <input
            type="text"
            placeholder="🔍 Search by name, department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3"
          />
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredEmployees.map((employee) => (
              <label
                key={employee.id}
                className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(employee.id)}
                  onChange={() => handleToggleEmployee(employee.id)}
                  className="mr-3 w-5 h-5"
                />
                <div>
                  <div className="font-medium">{employee.name}</div>
                  <div className="text-sm text-gray-500">{employee.department}</div>
                </div>
              </label>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {selectedEmployees.length} employee(s) selected
          </p>
        </div>

        {/* Start Date */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate.toISOString().split('T')[0]}
            onChange={(e) => setStartDate(new Date(e.target.value))}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Due Date */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Due Date (Optional):
          </label>
          <input
            type="date"
            value={dueDate?.toISOString().split('T')[0] || ''}
            onChange={(e) => setDueDate(e.target.value ? new Date(e.target.value) : null)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Priority */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Priority:
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="optional"
                checked={priority === 'optional'}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mr-2"
              />
              Optional
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="recommended"
                checked={priority === 'recommended'}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mr-2"
              />
              Recommended
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="priority"
                value="mandatory"
                checked={priority === 'mandatory'}
                onChange={(e) => setPriority(e.target.value as any)}
                className="mr-2"
              />
              Mandatory
            </label>
          </div>
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Message (Optional):
          </label>
          <textarea
            placeholder="Add a note for the employees..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedEmployees.length === 0}
            className="flex-1 px-6 py-3 bg-rust-primary text-white rounded-lg font-semibold hover:bg-rust-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Assign Course to {selectedEmployees.length} Employee{selectedEmployees.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
};
```

**3. Add Progress Dashboard Tab**

Below the course catalog, add a tab for "Employee Progress":

```typescript
const [activeTab, setActiveTab] = useState<'catalog' | 'progress'>('catalog');

<div className="mb-6">
  <div className="border-b border-gray-200">
    <nav className="flex gap-8">
      <button
        onClick={() => setActiveTab('catalog')}
        className={`pb-4 px-2 font-semibold ${
          activeTab === 'catalog'
            ? 'border-b-2 border-rust-primary text-rust-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Course Catalog
      </button>
      <button
        onClick={() => setActiveTab('progress')}
        className={`pb-4 px-2 font-semibold ${
          activeTab === 'progress'
            ? 'border-b-2 border-rust-primary text-rust-primary'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Employee Progress
      </button>
    </nav>
  </div>
</div>

{activeTab === 'catalog' && (
  <div>
    {/* Existing course catalog */}
  </div>
)}

{activeTab === 'progress' && (
  <div>
    {/* Progress tracking table */}
    <EmployeeProgressTable />
  </div>
)}
```

**4. Employee Progress Table Component**

```typescript
const EmployeeProgressTable: React.FC = () => {
  // Mock data (replace with API call)
  const progressData = [
    {
      employeeId: '1',
      employeeName: 'Alex Johnson',
      course: 'InsuranceSuite Config',
      progress: 100,
      status: 'completed',
      completedDate: '2025-11-15',
    },
    {
      employeeId: '2',
      employeeName: 'Maria Garcia',
      course: 'InsuranceSuite Config',
      progress: 35,
      status: 'in-progress',
      startedDate: '2025-11-10',
    },
    {
      employeeId: '3',
      employeeName: 'John Smith',
      course: 'InsuranceSuite Config',
      progress: 0,
      status: 'not-started',
      assignedDate: '2025-11-20',
    },
    {
      employeeId: '4',
      employeeName: 'Sarah Chen',
      course: 'Security Awareness',
      progress: 80,
      status: 'overdue',
      dueDate: '2025-11-15',
    },
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      'completed': '✅ Completed',
      'in-progress': '🟡 In Progress',
      'not-started': '⏸️ Not Started',
      'overdue': '🔴 Overdue',
    };
    return badges[status] || status;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left p-4 font-semibold">Employee</th>
            <th className="text-left p-4 font-semibold">Course</th>
            <th className="text-left p-4 font-semibold">Progress</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-left p-4 font-semibold">Date</th>
            <th className="text-left p-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {progressData.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 font-medium">{item.employeeName}</td>
              <td className="p-4">{item.course}</td>
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{item.progress}%</span>
                </div>
              </td>
              <td className="p-4">{getStatusBadge(item.status)}</td>
              <td className="p-4 text-sm text-gray-600">
                {item.completedDate || item.startedDate || item.assignedDate || '-'}
              </td>
              <td className="p-4">
                <button className="text-rust-primary hover:underline text-sm font-medium">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

### **Screen 3: People Directory (`/hr/people`)**

**Purpose:** Searchable employee roster

**Status:** ❓ Unknown

**Expected Layout:**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  People Directory                           │
│  52 Active Employees                        │
├─────────────────────────────────────────────┤
│  🔍 [Search by name, role, department...]  │
│  Filter: [All▼] [Department▼] [Location▼] │
│  Sort: [Name▼] [Export CSV]                │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐   │
│  │ 👤 Alex Johnson                     │   │
│  │    Senior Engineer · Engineering    │   │
│  │    alex@intime.com · 555-0100      │   │
│  │    Reports to: Jane Smith          │   │
│  │    [View Profile]                   │   │
│  └─────────────────────────────────────┘   │
│  ... (more employee cards)                  │
└─────────────────────────────────────────────┘
```

**Interactive Elements:**
- Search box (filters as you type)
- Department filter dropdown
- Location filter (remote/office)
- Status filter (active/on leave/terminated)
- Sort dropdown (name, department, hire date)
- Click employee card → Navigate to profile
- Export to CSV button

**What Needs to Be Built:**
1. Employee list component
2. Search functionality (client-side filter)
3. Filter dropdowns
4. Employee card component
5. Pagination (if >50 employees)
6. CSV export function

---

### **Screen 4: Employee Profile (`/hr/profile/:employeeId`)**

**Purpose:** Detailed employee information

**Status:** ❓ Unknown

**Expected Layout:**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  ← Back to People                           │
│                                             │
│  👤 Alex Johnson                            │
│     Senior Engineer                         │
│     alex@intime.com · 555-0100             │
│     [Edit Profile] [Deactivate]            │
├─────────────────────────────────────────────┤
│  Tabs: [Overview] [Training] [Performance] │
│        [Time & Pay] [Documents]             │
├─────────────────────────────────────────────┤
│  OVERVIEW TAB:                              │
│                                             │
│  Personal Information:                      │
│  • Hire Date: Jan 15, 2024                 │
│  • Department: Engineering                  │
│  • Location: San Francisco, CA             │
│  • Manager: Jane Smith                     │
│  • Employee ID: EMP-001                    │
│                                             │
│  Contact:                                   │
│  • Email: alex@intime.com                  │
│  • Phone: 555-0100                         │
│  • Emergency: Jane Johnson (Spouse)        │
│    555-0101                                 │
│                                             │
│  Compensation:                              │
│  • Base Salary: $120,000/year              │
│  • Bonus Target: 15%                       │
│  • Last Review: Oct 2025 (+8%)             │
│  • Next Review: Apr 2026                   │
│                                             │
│  Benefits:                                  │
│  • Health: PPO Plan A                      │
│  • 401(k): 6% (company match 4%)          │
│  • PTO Balance: 12 days                    │
└─────────────────────────────────────────────┘
```

**Other Tabs:**

**Training Tab:**
- List of assigned courses
- Completion status
- Certificates earned
- Skills inventory

**Performance Tab:**
- Review history
- Current goals/OKRs
- Peer feedback
- Promotion track

**Time & Pay Tab:**
- Timesheet history
- Pay stub archive
- Tax documents (W-2, etc.)
- Expense reports

**Documents Tab:**
- Signed offer letter
- I-9 and background check
- Benefits enrollment
- Handbook acknowledgment
- Certifications (Guidewire, etc.)

**What Needs to Be Built:**
1. Tab navigation component
2. Profile header with photo
3. Information display sections
4. Edit mode for HR
5. Document upload/download
6. Audit log (who viewed/edited)

---

### **Screen 5: Time & Attendance (`/hr/time`)**

**Purpose:** Timesheet approval and PTO management

**Status:** ❓ Unknown

**Expected Layout:**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  Time & Attendance                          │
│  Week of Nov 20-26, 2025                   │
│  [◀ Previous Week] [Next Week ▶]           │
├─────────────────────────────────────────────┤
│  Pending Approvals: 12                      │
│  [View All] [Bulk Approve]                 │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ ☐ Alex Johnson - 40.0 hrs          │   │
│  │    Mon-Fri: Regular hours           │   │
│  │    [Approve] [Reject] [View]       │   │
│  └─────────────────────────────────────┘   │
│  ... (more pending timesheets)              │
│                                             │
│  PTO Requests (3 pending):                  │
│  ┌─────────────────────────────────────┐   │
│  │ Maria Garcia                        │   │
│  │ Dec 20-24, 2025 (5 days)           │   │
│  │ Type: Vacation                      │   │
│  │ [Approve] [Deny]                    │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Interactive Elements:**
- Week selector (previous/next)
- Checkbox to select multiple timesheets
- "Bulk Approve" button
- View detailed timesheet modal
- Approve/reject buttons
- PTO request approval
- Filter by department/employee
- Export to CSV for payroll

**What Needs to Be Built:**
1. Timesheet list with status badges
2. Bulk selection checkboxes
3. Approval workflow
4. Detailed timesheet modal
5. PTO request cards
6. Calendar view option
7. Export functionality

---

### **Screen 6: Organization Chart (`/hr/org`)**

**Purpose:** Visual company hierarchy

**Status:** ❓ Unknown

**Expected Layout:**
```
┌─────────────────────────────────────────────┐
│  [Navbar]                                   │
├─────────────────────────────────────────────┤
│  Organization Chart                         │
│  [Tree View] [List View] [Export]          │
├─────────────────────────────────────────────┤
│                                             │
│           ┌─────────────┐                   │
│           │   CEO       │                   │
│           │ John Doe    │                   │
│           └──────┬──────┘                   │
│                  │                           │
│       ┌──────────┼──────────┐               │
│       │          │          │               │
│  ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐         │
│  │  CTO   │ │  CFO   │ │  COO   │         │
│  │ Jane S.│ │ Mike W.│ │ Sara C.│         │
│  └────┬───┘ └────────┘ └────┬───┘         │
│       │                      │               │
│  ┌────▼────┐           ┌────▼────┐         │
│  │ Head of │           │ Head of │         │
│  │  Eng.   │           │   HR    │         │
│  └─────────┘           └─────────┘         │
│                                             │
│  Click any node to see details             │
└─────────────────────────────────────────────┘
```

**Interactive Elements:**
- Drag to pan
- Zoom in/out
- Click node → Show employee details
- Expand/collapse departments
- Switch to list view
- Search employee (highlights in tree)
- Export as PNG/PDF

**Implementation:**
- Use library like `react-organizational-chart` or `d3.js`
- Data structure: Each employee has `managerId` field
- Build tree from flat employee list

**What Needs to Be Built:**
1. Tree rendering component
2. Interactive node component
3. Zoom/pan controls
4. Employee detail modal
5. Search integration
6. Export functionality

---

## 🎨 Design System

### Colors (Inherit from Academy)

```css
/* Primary */
--rust-primary: #C84B31;      /* Buttons, CTAs */
--charcoal: #2D4059;           /* Headers, text */
--ivory: #F5F5F5;              /* Backgrounds */
--sage: #88A096;               /* Accents */

/* Status */
--success: #4CAF50;            /* Completed, approved */
--warning: #FF9800;            /* In progress, pending */
--error: #F44336;              /* Overdue, rejected */
--info: #2196F3;               /* Info badges */

/* HR-Specific */
--purple: #9C27B0;             /* Performance/reviews */
--teal: #009688;               /* Time & attendance */
--amber: #FFC107;              /* Compliance warnings */
```

### Typography

```css
/* Headers */
h1 { font-size: 2.5rem; font-weight: 700; }
h2 { font-size: 2rem; font-weight: 600; }
h3 { font-size: 1.5rem; font-weight: 600; }

/* Body */
body { font-size: 1rem; line-height: 1.6; }

/* Labels */
label { font-size: 0.875rem; font-weight: 600; }
```

### Components

**Stat Cards:**
```css
.stat-card {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--charcoal);
}

.stat-label {
  font-size: 0.875rem;
  text-transform: uppercase;
  color: var(--gray-500);
}
```

**Status Badges:**
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
}

.badge-success {
  background: #E8F5E9;
  color: #2E7D32;
}

.badge-warning {
  background: #FFF3E0;
  color: #E65100;
}

.badge-error {
  background: #FFEBEE;
  color: #C62828;
}
```

**Tables:**
```css
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--gray-50);
  border-bottom: 2px solid var(--gray-200);
}

.table th {
  text-align: left;
  padding: 1rem;
  font-weight: 600;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-100);
}

.table tbody tr:hover {
  background: var(--gray-50);
}
```

---

## 🔧 Remaining Work

### Priority 1: CRITICAL (Blocks HR Demos)

**1. Fix "Assign to Employee" Button (2-3 hours)**
- Location: `frontend-prototype/components/hr/LearningAdmin.tsx`
- Tasks:
  - Create `AssignCourseModal` component
  - Add employee multi-select with search
  - Add date pickers (start, due)
  - Add priority radio buttons
  - Add optional message textarea
  - Wire up onClick handler
  - Show success notification
  - Update course card enrollment count
- Complexity: Medium
- Impact: Unblocks entire HR training workflow

### Priority 2: HIGH (Complete L&D Module)

**2. Add Employee Progress Dashboard (3-4 hours)**
- Location: `frontend-prototype/components/hr/LearningAdmin.tsx`
- Tasks:
  - Create tab navigation (Catalog | Progress)
  - Create `EmployeeProgressTable` component
  - Add filter/search
  - Add sort functionality
  - Add "Send Reminder" button
  - Add "Export CSV" button
- Complexity: Medium
- Impact: Provides visibility into training completion

**3. Test Other HR Pages (2 hours)**
- Navigate to each HR route
- Document what exists vs. missing
- Take screenshots
- Create issue list
- URLs to test:
  - `/hr/dashboard`
  - `/hr/people`
  - `/hr/org`
  - `/hr/time`
  - `/hr/payroll`
  - `/hr/performance`
  - `/hr/recruitment`
  - `/hr/documents`
  - `/hr/analytics`

### Priority 3: MEDIUM (Employee Self-Service)

**4. Build Employee Portal Pages (8-12 hours)**
- Create `/employee/dashboard`
- Create `/employee/profile`
- Create `/employee/training` (shows assigned courses)
- Create `/employee/timesheet`
- Create `/employee/paystubs`
- Create `/employee/benefits`

**5. Create Shared Components (4-6 hours)**
- `EmployeeCard` component
- `StatCard` component
- `ProgressBar` component
- `StatusBadge` component
- `DataTable` component
- `Modal` wrapper component
- `DatePicker` component

### Priority 4: NICE TO HAVE

**6. Advanced Features (8-12 hours)**
- Org chart visualization
- Bulk operations (bulk approve, bulk assign)
- Advanced filters (date range, status, etc.)
- Export to PDF/CSV
- Email notifications (UI only, backend later)
- Audit log display

---

## 📋 Testing Checklist

### HR Learning Admin
- [ ] Page loads at `/hr/learning`
- [ ] Stats cards display correctly
- [ ] Course catalog shows all courses
- [ ] "Assign to Employee" button works
- [ ] Modal opens with employee list
- [ ] Can search/filter employees
- [ ] Can select multiple employees
- [ ] Can set start/due dates
- [ ] Can choose priority level
- [ ] Can add optional message
- [ ] Submit button works
- [ ] Success notification shows
- [ ] Modal closes after submit
- [ ] Course card updates enrollment count
- [ ] Progress tab shows employee progress
- [ ] Can filter progress table
- [ ] Can export to CSV

### People Directory
- [ ] Page loads at `/hr/people`
- [ ] Employee list displays
- [ ] Search works (filters live)
- [ ] Department filter works
- [ ] Status filter works
- [ ] Sort dropdown works
- [ ] Click employee → Navigate to profile
- [ ] Export CSV works
- [ ] Pagination works (if needed)

### Employee Profile
- [ ] Page loads at `/hr/profile/:id`
- [ ] Profile header displays
- [ ] Tab navigation works
- [ ] Overview tab shows all info
- [ ] Training tab shows courses
- [ ] Performance tab shows reviews
- [ ] Time & Pay tab shows history
- [ ] Documents tab shows files
- [ ] Edit mode works (for HR)
- [ ] Save changes works

### Time & Attendance
- [ ] Page loads at `/hr/time`
- [ ] Pending timesheets display
- [ ] Week selector works
- [ ] View detailed timesheet works
- [ ] Approve button works
- [ ] Reject button works
- [ ] Bulk approve works
- [ ] PTO requests display
- [ ] Approve PTO works
- [ ] Export to CSV works

---

## 🚀 Implementation Timeline

### Week 1 (Priority 1)
**Day 1-2:** Fix "Assign to Employee" button (2-3 hrs)
- Create modal component
- Wire up functionality
- Test end-to-end

**Day 3:** Add employee progress dashboard (3-4 hrs)
- Create tab navigation
- Build progress table
- Add filters

**Day 4:** Test all HR pages (2 hrs)
- Navigate to each route
- Document status
- Create issue list

**Day 5:** Polish & bug fixes (2 hrs)
- Fix any issues found
- Responsive design check
- Cross-browser testing

**End of Week 1:** HR Learning Admin 100% complete ✅

### Week 2 (Priority 2-3)
**Day 1-2:** Build People Directory (6 hrs)
- Employee list component
- Search & filters
- Employee cards
- Export functionality

**Day 3:** Build Employee Profile (6 hrs)
- Profile layout
- Tab structure
- Information display
- Edit mode

**Day 4-5:** Build Time & Attendance (8 hrs)
- Timesheet list
- Approval workflow
- PTO requests
- Calendar view

**End of Week 2:** Core HR modules complete ✅

### Week 3 (Priority 4)
**Day 1-2:** Employee self-service portal (8 hrs)
- Dashboard
- My Training
- Timesheet submission

**Day 3-4:** Shared components library (6 hrs)
- Reusable components
- Storybook setup
- Documentation

**Day 5:** Polish & QA (4 hrs)
- E2E testing
- Bug fixes
- Demo preparation

**End of Week 3:** Full HR portal demo-ready ✅

---

## 💡 Developer Notes

### State Management

For HR portal, recommend Zustand store:

```typescript
// stores/hrStore.ts
import { create } from 'zustand';

interface HRState {
  employees: Employee[];
  courses: Course[];
  assignments: Assignment[];
  timesheets: Timesheet[];

  // Actions
  fetchEmployees: () => Promise<void>;
  assignCourse: (data: AssignmentData) => Promise<void>;
  approveTimesheet: (timesheetId: string) => Promise<void>;
  filterEmployees: (filters: EmployeeFilters) => Employee[];
}

export const useHRStore = create<HRState>((set, get) => ({
  employees: [],
  courses: [],
  assignments: [],
  timesheets: [],

  fetchEmployees: async () => {
    // Mock for now, replace with API call
    const employees = MOCK_EMPLOYEES;
    set({ employees });
  },

  assignCourse: async (data) => {
    // Create assignments
    const newAssignments = data.employeeIds.map(empId => ({
      id: generateId(),
      courseId: data.courseId,
      employeeId: empId,
      startDate: data.startDate,
      dueDate: data.dueDate,
      priority: data.priority,
      message: data.message,
      status: 'assigned',
      progress: 0,
    }));

    set(state => ({
      assignments: [...state.assignments, ...newAssignments],
    }));

    // Show success notification
    showToast(`Course assigned to ${data.employeeIds.length} employees`);
  },

  approveTimesheet: async (timesheetId) => {
    set(state => ({
      timesheets: state.timesheets.map(ts =>
        ts.id === timesheetId
          ? { ...ts, status: 'approved', approvedBy: currentUser.id, approvedAt: new Date() }
          : ts
      ),
    }));

    showToast('Timesheet approved');
  },

  filterEmployees: (filters) => {
    const { employees } = get();
    return employees.filter(emp => {
      if (filters.department && emp.department !== filters.department) return false;
      if (filters.status && emp.status !== filters.status) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          emp.name.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term)
        );
      }
      return true;
    });
  },
}));
```

### Mock Data

```typescript
// constants/mockHRData.ts

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Alex Johnson',
    email: 'alex@intime.com',
    phone: '555-0100',
    department: 'Engineering',
    role: 'Senior Engineer',
    managerId: 'emp-10',
    status: 'active',
    hireDate: '2024-01-15',
    location: 'San Francisco, CA',
    photo: '/avatars/alex.jpg',
  },
  // ... more employees
];

export const MOCK_COURSE_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    courseId: 'course-1',
    employeeId: 'emp-1',
    startDate: '2025-11-10',
    dueDate: '2025-12-31',
    priority: 'recommended',
    status: 'completed',
    progress: 100,
    completedDate: '2025-11-15',
  },
  {
    id: 'assign-2',
    courseId: 'course-1',
    employeeId: 'emp-2',
    startDate: '2025-11-10',
    dueDate: '2025-12-31',
    priority: 'recommended',
    status: 'in-progress',
    progress: 35,
  },
  // ... more assignments
];

export const MOCK_TIMESHEETS: Timesheet[] = [
  {
    id: 'ts-1',
    employeeId: 'emp-1',
    weekStarting: '2025-11-20',
    weekEnding: '2025-11-26',
    totalHours: 40.0,
    status: 'pending',
    entries: [
      { date: '2025-11-20', hours: 8.0, project: 'Project A', billable: true },
      { date: '2025-11-21', hours: 8.0, project: 'Project A', billable: true },
      { date: '2025-11-22', hours: 8.0, project: 'Admin', billable: false },
      { date: '2025-11-23', hours: 8.0, project: 'Project A', billable: true },
      { date: '2025-11-24', hours: 8.0, project: 'Project B', billable: true },
    ],
  },
  // ... more timesheets
];
```

### TypeScript Types

```typescript
// types/hr.ts

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  managerId?: string;
  status: 'active' | 'on-leave' | 'terminated';
  hireDate: string;
  location: string;
  photo?: string;
  salary?: number;
  ptoBalance?: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  employeeId: string;
  startDate: string;
  dueDate?: string;
  priority: 'optional' | 'recommended' | 'mandatory';
  message?: string;
  status: 'assigned' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  completedDate?: string;
  score?: number;
}

export interface Timesheet {
  id: string;
  employeeId: string;
  weekStarting: string;
  weekEnding: string;
  totalHours: number;
  status: 'pending' | 'approved' | 'rejected';
  entries: TimesheetEntry[];
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface TimesheetEntry {
  date: string;
  hours: number;
  project: string;
  billable: boolean;
  notes?: string;
}

export interface PTORequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  days: number;
  type: 'vacation' | 'sick' | 'personal';
  status: 'pending' | 'approved' | 'denied';
  reason?: string;
  approvedBy?: string;
}
```

---

## 📞 FAQ

**Q: Do I need to integrate with backend?**
A: NO. Everything is frontend-only with mock data for now. Use Zustand for state management.

**Q: What about authentication?**
A: Not needed. Assume user is logged in as HR admin. Hardcode user data.

**Q: Should I build employee self-service portal?**
A: LATER. Focus on HR admin views first. Employee portal is Priority 3.

**Q: What about real data persistence?**
A: Not needed yet. Use in-memory state with Zustand. Data resets on page refresh (acceptable for now).

**Q: Mobile responsive required?**
A: YES. HR managers use tablets. Test on desktop (1440px), tablet (768px), mobile (375px).

**Q: Which pages are most important?**
A:
1. **#1 Priority:** /hr/learning (course assignment) - CRITICAL BUG TO FIX
2. **#2 Priority:** /hr/people (employee directory)
3. **#3 Priority:** /hr/time (timesheet approval)
4. Rest can wait

**Q: How do I test without backend?**
A: Use mock data in `constants/mockHRData.ts`. Simulate API delays with `setTimeout()` for realistic loading states.

---

## ✅ Deliverables

At completion, the HR portal should have:

1. **Working Learning Admin** (Assignment + Progress)
2. **People Directory** (Search + Profiles)
3. **Time & Attendance** (Approval workflow)
4. **Org Chart** (Visual hierarchy)
5. **Analytics Dashboard** (HR metrics)
6. **Responsive Design** (Desktop + Tablet)
7. **Professional Polish** (Loading states, animations)
8. **Demo-Ready** (Can show to clients)

---

## 🎯 Success Criteria

**The HR portal is complete when:**

✅ HR manager can assign a course to 5 employees (end-to-end)
✅ Can view progress for all assigned courses
✅ Can search/filter employee directory
✅ Can view detailed employee profile
✅ Can approve/reject timesheets
✅ Can visualize org chart
✅ All pages are responsive
✅ No console errors
✅ Professional design quality (matches Academy)

---

## 📚 Resources

- **Design Reference:** Academy module (`/academy/*` routes)
- **Component Library:** shadcn/ui (https://ui.shadcn.com)
- **Icons:** Lucide Icons (https://lucide.dev)
- **Color Palette:** Defined in tailwind.config.ts
- **Mock Data:** `frontend-prototype/constants/mockHRData.ts` (to be created)

---

**End of Specification**

You now have complete context to build the HR/Employee portal. Start with fixing the "Assign to Employee" button, then expand from there. Good luck! 🚀

---

**Document Version:** 1.0
**Last Updated:** 2025-11-23
**Estimated Total Work:** 40-60 hours (2-3 weeks for one developer)
**Current Completion:** 30% (one critical bug blocking demos)
