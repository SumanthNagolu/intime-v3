/**
 * GitHub Lab Provisioning Service
 * ACAD-008
 *
 * Handles automatic forking and provisioning of lab environments using GitHub API
 */

import { Octokit } from '@octokit/rest';
import {  LabProvisioningRequest, LabProvisioningResult, parseGitHubUrl } from '@/types/lab';

// Initialize Octokit with GitHub token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Provision a new lab environment for a student
 */
export async function provisionLabEnvironment(
  request: LabProvisioningRequest
): Promise<LabProvisioningResult> {
  const { templateUrl, githubUsername, timeLimitMinutes = 120 } = request;

  // Parse template URL
  const parsed = parseGitHubUrl(templateUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL format');
  }

  const { owner, repo } = parsed;

  try {
    // Fork the template repository
    const fork = await forkRepository(owner, repo, githubUsername);

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + timeLimitMinutes * 60 * 1000);

    return {
      instanceId: '', // Will be set by caller after database insert
      forkedRepoUrl: fork.html_url,
      expiresAt,
    };
  } catch (error: any) {
    throw new Error(`Failed to provision lab: ${error.message}`);
  }
}

/**
 * Fork a repository for a student
 */
async function forkRepository(
  owner: string,
  repo: string,
  studentUsername: string
): Promise<{ html_url: string; full_name: string }> {
  try {
    // Create fork
    const { data: fork } = await octokit.repos.createFork({
      owner,
      repo,
    });

    // Wait for fork to be ready
    await waitForFork(fork.owner.login, fork.name);

    // Grant student collaborator access
    try {
      await octokit.repos.addCollaborator({
        owner: fork.owner.login,
        repo: fork.name,
        username: studentUsername,
        permission: 'push',
      });
    } catch (error: any) {
      console.warn('Could not add collaborator:', error.message);
      // Non-critical error, continue
    }

    return {
      html_url: fork.html_url,
      full_name: fork.full_name,
    };
  } catch (error: any) {
    throw new Error(`Failed to fork repository: ${error.message}`);
  }
}

/**
 * Wait for fork to be ready
 */
async function waitForFork(owner: string, repo: string, maxAttempts: number = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await octokit.repos.get({ owner, repo });
      return; // Fork is ready
    } catch (error: any) {
      if (i === maxAttempts - 1) {
        throw new Error('Timeout waiting for fork to be ready');
      }
      // Wait 2 seconds before retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Trigger auto-grading workflow
 */
export async function triggerAutoGrading(
  repoUrl: string,
  workflowPath: string = '.github/workflows/autograder.yml'
): Promise<boolean> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL format');
  }

  const { owner, repo } = parsed;

  try {
    await octokit.actions.createWorkflowDispatch({
      owner,
      repo,
      workflow_id: workflowPath,
      ref: 'main',
    });

    return true;
  } catch (error: any) {
    console.error('Failed to trigger auto-grading:', error.message);
    return false;
  }
}

/**
 * Get test results from GitHub Actions workflow
 */
export async function getTestResults(
  repoUrl: string,
  runId: number
): Promise<{
  success: boolean;
  testsPassed: number;
  testsFailed: number;
  logs: string[];
}> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL format');
  }

  const { owner, repo } = parsed;

  try {
    const { data: run } = await octokit.actions.getWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });

    // Get job details
    const { data: jobs } = await octokit.actions.listJobsForWorkflowRun({
      owner,
      repo,
      run_id: runId,
    });

    // Parse test results from job logs
    const testResults = parseTestResultsFromJobs(jobs.jobs);

    return {
      success: run.conclusion === 'success',
      testsPassed: testResults.passed,
      testsFailed: testResults.failed,
      logs: testResults.logs,
    };
  } catch (error: any) {
    throw new Error(`Failed to get test results: ${error.message}`);
  }
}

/**
 * Parse test results from job data
 */
function parseTestResultsFromJobs(jobs: any[]): {
  passed: number;
  failed: number;
  logs: string[];
} {
  // This is a simplified parser
  // In production, you'd parse actual test output formats (Jest, PyTest, etc.)

  let passed = 0;
  let failed = 0;
  const logs: string[] = [];

  for (const job of jobs) {
    if (job.conclusion === 'success') {
      passed += 1;
    } else if (job.conclusion === 'failure') {
      failed += 1;
    }

    logs.push(`${job.name}: ${job.conclusion}`);
  }

  return { passed, failed, logs };
}

/**
 * Delete forked repository (cleanup)
 */
export async function cleanupLabEnvironment(repoUrl: string): Promise<boolean> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    throw new Error('Invalid GitHub URL format');
  }

  const { owner, repo } = parsed;

  try {
    await octokit.repos.delete({
      owner,
      repo,
    });

    return true;
  } catch (error: any) {
    console.error('Failed to cleanup lab:', error.message);
    return false;
  }
}

/**
 * Check if repository exists
 */
export async function checkRepositoryExists(repoUrl: string): Promise<boolean> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return false;
  }

  const { owner, repo } = parsed;

  try {
    await octokit.repos.get({ owner, repo });
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Get repository commit SHA
 */
export async function getLatestCommitSha(
  repoUrl: string,
  branch: string = 'main'
): Promise<string | null> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return null;
  }

  const { owner, repo } = parsed;

  try {
    const { data: ref } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    });

    return ref.object.sha;
  } catch (error: any) {
    console.error('Failed to get commit SHA:', error.message);
    return null;
  }
}

/**
 * Validate GitHub username
 */
export async function validateGitHubUsername(username: string): Promise<boolean> {
  try {
    await octokit.users.getByUsername({ username });
    return true;
  } catch (error: any) {
    return false;
  }
}

/**
 * Get repository file contents
 */
export async function getFileContents(
  repoUrl: string,
  filePath: string,
  ref: string = 'main'
): Promise<string | null> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return null;
  }

  const { owner, repo } = parsed;

  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: filePath,
      ref,
    });

    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }

    return null;
  } catch (error: any) {
    console.error('Failed to get file contents:', error.message);
    return null;
  }
}

/**
 * Create issue for student question/help
 */
export async function createLabIssue(
  repoUrl: string,
  title: string,
  body: string
): Promise<string | null> {
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return null;
  }

  const { owner, repo } = parsed;

  try {
    const { data: issue } = await octokit.issues.create({
      owner,
      repo,
      title,
      body,
    });

    return issue.html_url;
  } catch (error: any) {
    console.error('Failed to create issue:', error.message);
    return null;
  }
}
