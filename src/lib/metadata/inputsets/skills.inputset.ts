/**
 * Skills InputSet
 *
 * Reusable skills and requirements fields for jobs and candidates.
 * Follows Guidewire InputSet pattern for composable form sections.
 */

import type { InputSetConfig, FieldDefinition } from '../types';

/**
 * Experience level options
 */
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'entry', label: 'Entry Level (0-2 years)' },
  { value: 'mid', label: 'Mid Level (3-5 years)' },
  { value: 'senior', label: 'Senior (6-10 years)' },
  { value: 'lead', label: 'Lead/Principal (10+ years)' },
  { value: 'executive', label: 'Executive/Director' },
];

/**
 * Skill proficiency options
 */
export const SKILL_PROFICIENCY_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'expert', label: 'Expert' },
];

/**
 * Job requirements fields
 */
export const jobRequirementsFields: FieldDefinition[] = [
  {
    id: 'requiredSkills',
    label: 'Required Skills',
    fieldType: 'tags',
    required: true,
    description: 'Must-have skills for this position',
    placeholder: 'Type a skill and press Enter',
    config: {
      allowCustom: true,
      maxTags: 20,
      suggestions: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'Java', 'SQL', 'AWS', 'Docker', 'Kubernetes',
      ],
    },
  },
  {
    id: 'niceToHaveSkills',
    label: 'Nice to Have Skills',
    fieldType: 'tags',
    description: 'Preferred but not required skills',
    placeholder: 'Type a skill and press Enter',
    config: {
      allowCustom: true,
      maxTags: 15,
    },
  },
  {
    id: 'experienceLevel',
    label: 'Experience Level',
    fieldType: 'enum',
    required: true,
    config: {
      options: EXPERIENCE_LEVEL_OPTIONS,
    },
  },
  {
    id: 'yearsExperience',
    label: 'Years of Experience',
    fieldType: 'number',
    description: 'Minimum years of relevant experience',
    config: {
      min: 0,
      max: 50,
    },
  },
  {
    id: 'educationRequirement',
    label: 'Education',
    fieldType: 'enum',
    config: {
      options: [
        { value: 'none', label: 'No Requirement' },
        { value: 'highschool', label: 'High School' },
        { value: 'associate', label: "Associate's Degree" },
        { value: 'bachelor', label: "Bachelor's Degree" },
        { value: 'master', label: "Master's Degree" },
        { value: 'phd', label: 'PhD' },
      ],
    },
  },
  {
    id: 'certifications',
    label: 'Required Certifications',
    fieldType: 'tags',
    description: 'Professional certifications required',
    config: {
      allowCustom: true,
      suggestions: [
        'AWS Solutions Architect', 'PMP', 'Scrum Master', 'CKA',
        'CISSP', 'Azure Administrator', 'Google Cloud Professional',
      ],
    },
  },
];

/**
 * Job Requirements InputSet configuration
 */
export const jobRequirementsInputSet: InputSetConfig = {
  id: 'job-requirements',
  label: 'Requirements',
  description: 'Skills and experience requirements',
  fields: jobRequirementsFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'requiredSkills', colSpan: 2 },
      { fieldId: 'niceToHaveSkills', colSpan: 2 },
      { fieldId: 'experienceLevel', colSpan: 1 },
      { fieldId: 'yearsExperience', colSpan: 1 },
      { fieldId: 'educationRequirement', colSpan: 1 },
      { fieldId: 'certifications', colSpan: 2 },
    ],
  },
};

/**
 * Candidate skills fields
 */
export const candidateSkillsFields: FieldDefinition[] = [
  {
    id: 'primarySkills',
    label: 'Primary Skills',
    fieldType: 'tags',
    required: true,
    description: 'Main technical skills',
    config: {
      allowCustom: true,
      maxTags: 15,
      suggestions: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'Java', 'SQL', 'AWS', 'Docker', 'Kubernetes',
      ],
    },
  },
  {
    id: 'secondarySkills',
    label: 'Secondary Skills',
    fieldType: 'tags',
    description: 'Additional technical skills',
    config: {
      allowCustom: true,
      maxTags: 20,
    },
  },
  {
    id: 'tools',
    label: 'Tools & Technologies',
    fieldType: 'tags',
    description: 'Software, tools, and platforms',
    config: {
      allowCustom: true,
      suggestions: [
        'Git', 'Jira', 'Confluence', 'VS Code', 'IntelliJ',
        'Postman', 'Figma', 'Slack', 'AWS Console',
      ],
    },
  },
  {
    id: 'totalExperience',
    label: 'Total Experience',
    fieldType: 'number',
    description: 'Total years of professional experience',
    config: {
      min: 0,
      max: 50,
      suffix: 'years',
    },
  },
  {
    id: 'experienceLevel',
    label: 'Experience Level',
    fieldType: 'enum',
    config: {
      options: EXPERIENCE_LEVEL_OPTIONS,
    },
  },
];

/**
 * Candidate Skills InputSet configuration
 */
export const candidateSkillsInputSet: InputSetConfig = {
  id: 'candidate-skills',
  label: 'Skills',
  description: 'Technical skills and experience',
  fields: candidateSkillsFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'primarySkills', colSpan: 2 },
      { fieldId: 'secondarySkills', colSpan: 2 },
      { fieldId: 'tools', colSpan: 2 },
      { fieldId: 'totalExperience', colSpan: 1 },
      { fieldId: 'experienceLevel', colSpan: 1 },
    ],
  },
};

/**
 * Education fields
 */
export const educationFields: FieldDefinition[] = [
  {
    id: 'degree',
    label: 'Degree',
    fieldType: 'enum',
    required: true,
    config: {
      options: [
        { value: 'highschool', label: 'High School Diploma' },
        { value: 'associate', label: "Associate's Degree" },
        { value: 'bachelor', label: "Bachelor's Degree" },
        { value: 'master', label: "Master's Degree" },
        { value: 'phd', label: 'PhD/Doctorate' },
        { value: 'other', label: 'Other' },
      ],
    },
  },
  {
    id: 'fieldOfStudy',
    label: 'Field of Study',
    fieldType: 'text',
    placeholder: 'Computer Science',
    config: {
      maxLength: 200,
    },
  },
  {
    id: 'institution',
    label: 'Institution',
    fieldType: 'text',
    required: true,
    placeholder: 'Stanford University',
    config: {
      maxLength: 200,
    },
  },
  {
    id: 'graduationYear',
    label: 'Graduation Year',
    fieldType: 'number',
    config: {
      min: 1950,
      max: 2030,
    },
  },
  {
    id: 'gpa',
    label: 'GPA',
    fieldType: 'number',
    config: {
      min: 0,
      max: 4,
      precision: 2,
    },
  },
];

/**
 * Education InputSet configuration
 */
export const educationInputSet: InputSetConfig = {
  id: 'education',
  label: 'Education',
  description: 'Educational background',
  fields: educationFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'degree', colSpan: 1 },
      { fieldId: 'fieldOfStudy', colSpan: 1 },
      { fieldId: 'institution', colSpan: 2 },
      { fieldId: 'graduationYear', colSpan: 1 },
      { fieldId: 'gpa', colSpan: 1 },
    ],
  },
};

/**
 * Certification fields
 */
export const certificationFields: FieldDefinition[] = [
  {
    id: 'name',
    label: 'Certification Name',
    fieldType: 'text',
    required: true,
    placeholder: 'AWS Solutions Architect Professional',
    config: {
      maxLength: 200,
    },
  },
  {
    id: 'issuingOrg',
    label: 'Issuing Organization',
    fieldType: 'text',
    required: true,
    placeholder: 'Amazon Web Services',
    config: {
      maxLength: 200,
    },
  },
  {
    id: 'issueDate',
    label: 'Issue Date',
    fieldType: 'date',
  },
  {
    id: 'expiryDate',
    label: 'Expiry Date',
    fieldType: 'date',
  },
  {
    id: 'credentialId',
    label: 'Credential ID',
    fieldType: 'text',
    placeholder: 'ABC123XYZ',
    config: {
      maxLength: 100,
    },
  },
  {
    id: 'credentialUrl',
    label: 'Credential URL',
    fieldType: 'url',
    placeholder: 'https://verify.example.com/cert/ABC123',
  },
];

/**
 * Certification InputSet configuration
 */
export const certificationInputSet: InputSetConfig = {
  id: 'certification',
  label: 'Certification',
  description: 'Professional certification details',
  fields: certificationFields,
  layout: {
    columns: 2,
    fieldLayout: [
      { fieldId: 'name', colSpan: 2 },
      { fieldId: 'issuingOrg', colSpan: 2 },
      { fieldId: 'issueDate', colSpan: 1 },
      { fieldId: 'expiryDate', colSpan: 1 },
      { fieldId: 'credentialId', colSpan: 1 },
      { fieldId: 'credentialUrl', colSpan: 1 },
    ],
  },
};

export default jobRequirementsInputSet;
