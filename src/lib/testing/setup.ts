/**
 * Vitest Setup File
 *
 * Runs before all test files.
 * Configures global test utilities and mocks.
 */

import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
process.env.SUPABASE_SERVICE_KEY = 'test-service-key'; // Changed from SUPABASE_SERVICE_ROLE_KEY
process.env.OPENAI_API_KEY = 'sk-test-openai-key';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-anthropic-key';
process.env.HELICONE_API_KEY = 'sk-helicone-test-key';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client (enhanced for AI tests)
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      signIn: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })).mockReturnThis(),
      update: vi.fn(() => Promise.resolve({ data: [], error: null })).mockReturnThis(),
      upsert: vi.fn(() => Promise.resolve({ data: [], error: null })).mockReturnThis(),
      delete: vi.fn(() => Promise.resolve({ data: [], error: null })).mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        remove: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    },
  })),
}));

// Mock OpenAI SDK (intelligent responses for classification)
vi.mock('openai', () => {
  const OpenAI = vi.fn();
  OpenAI.prototype.chat = {
    completions: {
      create: vi.fn((params: { messages?: Array<{ role: string; content: string }> }) => {
        // Smart classification based on input content
        const userMessage = params.messages?.find((m: { role: string; content: string }) => m.role === 'user')?.content || '';
        let responseContent = 'This is a test response from mocked OpenAI';

        // Classification logic for CoordinatorAgent
        if (userMessage.includes('resume') || userMessage.includes('CV')) {
          responseContent = JSON.stringify({ category: 'resume_help', confidence: 0.95 });
        } else if (userMessage.includes('project plan') || userMessage.includes('milestone')) {
          responseContent = JSON.stringify({ category: 'project_planning', confidence: 0.92 });
        } else if (userMessage.includes('interview') || userMessage.includes('behavioral')) {
          responseContent = JSON.stringify({ category: 'interview_prep', confidence: 0.88 });
        } else if (userMessage.includes('rating') || userMessage.includes('PolicyCenter') || userMessage.includes('code') || userMessage.includes('function')) {
          responseContent = JSON.stringify({ category: 'code_question', confidence: 0.90 });
        } else if (params.response_format?.type === 'json_object') {
          // Generic JSON response for other JSON requests
          responseContent = JSON.stringify({ category: 'code_question', confidence: 0.85 });
        }

        return Promise.resolve({
          id: 'chatcmpl-test',
          object: 'chat.completion',
          created: Date.now(),
          model: params.model || 'gpt-4o-mini',
          choices: [
            {
              index: 0,
              message: {
                role: 'assistant',
                content: responseContent,
              },
              finish_reason: 'stop',
            },
          ],
          usage: {
            prompt_tokens: 100,
            completion_tokens: 50,
            total_tokens: 150,
          },
        });
      }),
    },
  };
  OpenAI.prototype.embeddings = {
    create: vi.fn(() =>
      Promise.resolve({
        object: 'list',
        data: [
          {
            object: 'embedding',
            embedding: Array(1536).fill(0.1),
            index: 0,
          },
        ],
        model: 'text-embedding-3-small',
        usage: {
          prompt_tokens: 100,
          total_tokens: 100,
        },
      })
    ),
  };
  return { default: OpenAI };
});

// Mock Anthropic SDK
vi.mock('@anthropic-ai/sdk', () => {
  const Anthropic = vi.fn();
  Anthropic.prototype.messages = {
    create: vi.fn(() =>
      Promise.resolve({
        id: 'msg-test',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: 'This is a test response from mocked Anthropic Claude',
          },
        ],
        model: 'claude-sonnet-4-5-20250929',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      })
    ),
  };
  return { default: Anthropic };
});

// Suppress console errors in tests (optional, remove if you want to see them)
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: useLayoutEffect') ||
        args[0].includes('Not implemented: HTMLFormElement.prototype.requestSubmit'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Global test utilities
declare global {
  function mockUser(user: { id: string; email: string; orgId: string }): void;
  function clearMockUser(): void;
}

// Mock authenticated user
let mockAuthUser: { id: string; email: string; orgId: string } | null = null;

global.mockUser = (user) => {
  mockAuthUser = user;
};

global.clearMockUser = () => {
  mockAuthUser = null;
};

// Export for use in tests
export { mockAuthUser };
