/**
 * Capstone Requirements Component
 * ACAD-012
 *
 * Display capstone project requirements and guidelines for students
 */

'use client';

import {
  Code,
  FileText,
  TestTube,
  Users,
  Video,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { DEFAULT_RUBRIC_CRITERIA } from '@/types/capstone';

export interface CapstoneRequirementsProps {
  courseTitle: string;
  passingGrade?: number;
  estimatedHours?: number;
}

export function CapstoneRequirements({
  courseTitle,
  passingGrade = 70,
  estimatedHours = 40,
}: CapstoneRequirementsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Capstone Project Requirements</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Final project for <strong>{courseTitle}</strong>
        </p>
      </div>

      {/* Overview */}
      <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Project Overview</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-4">
          The capstone project is your opportunity to demonstrate mastery of the skills and
          concepts learned throughout this course. You'll build a complete application from
          scratch, showcasing your technical abilities and problem-solving skills.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Passing Grade:</strong>
              <div>{passingGrade}% or higher</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Peer Reviews:</strong>
              <div>Minimum 3 required</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Estimated Time:</strong>
              <div>{estimatedHours}+ hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grading Rubric */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Grading Rubric (100 points)</h2>
        <div className="space-y-3">
          {DEFAULT_RUBRIC_CRITERIA.map((criterion) => (
            <div
              key={criterion.name}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold capitalize">
                  {criterion.name.replace(/([A-Z])/g, ' $1').trim()}
                </h3>
                <span className="text-lg font-bold text-blue-600">
                  {criterion.maxPoints} pts
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {criterion.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Technical Requirements */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Technical Requirements</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Code className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Code Quality</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Clean, readable, and well-organized code</li>
                <li>• Follows language-specific best practices and conventions</li>
                <li>• Proper error handling and edge case management</li>
                <li>• DRY (Don't Repeat Yourself) principles applied</li>
                <li>• Meaningful variable and function names</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <FileText className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Documentation</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Comprehensive README.md with project overview</li>
                <li>• Clear setup and installation instructions</li>
                <li>• API documentation (if applicable)</li>
                <li>• Code comments for complex logic</li>
                <li>• Architecture and design decisions explained</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <TestTube className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Testing</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• Unit tests for core functionality</li>
                <li>• Integration tests for critical paths</li>
                <li>• Test coverage report included</li>
                <li>• All tests passing before submission</li>
                <li>• Edge cases and error conditions tested</li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Video className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2">Demo Video (Optional but Recommended)</h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>• 3-5 minute walkthrough of your project</li>
                <li>• Demonstrate all major features</li>
                <li>• Explain technical challenges and solutions</li>
                <li>• Show the application in action</li>
                <li>• Upload to YouTube, Loom, or similar platform</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Process */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Submission Process</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
              1
            </div>
            <div>
              <h3 className="font-semibold">Complete Your Project</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Build your capstone project ensuring all technical requirements are met.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
              2
            </div>
            <div>
              <h3 className="font-semibold">Push to GitHub</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Upload your code to a public GitHub repository with a complete README.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
              3
            </div>
            <div>
              <h3 className="font-semibold">Submit for Review</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Submit your repository URL and optional demo video through the submission
                form.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
              4
            </div>
            <div>
              <h3 className="font-semibold">Peer Review</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your project will be reviewed by at least 3 peers. You'll also review other
                students' projects.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center font-bold text-blue-600">
              5
            </div>
            <div>
              <h3 className="font-semibold">Trainer Grading</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your trainer will provide final grading and feedback using the rubric.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center font-bold text-green-600">
              ✓
            </div>
            <div>
              <h3 className="font-semibold">Graduate!</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Once you pass, you'll automatically graduate and receive your certificate.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips for Success */}
      <div className="p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Tips for Success</h2>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li>✓ Start early and plan your project timeline</li>
          <li>✓ Commit your code regularly with meaningful messages</li>
          <li>✓ Write tests as you develop features</li>
          <li>✓ Keep your README updated throughout development</li>
          <li>✓ Test your application thoroughly before submission</li>
          <li>✓ Ask for help when you're stuck</li>
          <li>✓ Be creative and showcase your unique skills</li>
          <li>✓ Pay attention to peer review feedback</li>
        </ul>
      </div>

      {/* Revision Policy */}
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Revision Policy</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          If your project doesn't meet the requirements, you'll have the opportunity to make
          revisions based on feedback. You can resubmit as many times as needed until you
          pass. Each revision will be tracked and reviewed.
        </p>
      </div>
    </div>
  );
}
