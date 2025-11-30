'use client';

import { useState } from 'react';

/**
 * Test Error Page - FOR DEVELOPMENT ONLY
 * Navigate to /test-error to trigger an error and see the error page
 * Delete this file before deploying to production
 */

// Component that throws during render
function ErrorThrower(): React.ReactElement {
  throw new Error('This is a test error to preview the error page design');
}

export default function TestErrorPage() {
  const [shouldError, setShouldError] = useState(false);

  // Render the ErrorThrower component which will throw during render
  // This will trigger the error boundary
  if (shouldError) {
    return <ErrorThrower />;
  }

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-heading font-bold text-charcoal-900 mb-4">
          Error Page Test
        </h1>
        <p className="text-charcoal-600 mb-8">
          Click the button below to trigger an error and see the custom error page.
        </p>
        <button
          onClick={() => setShouldError(true)}
          className="px-8 py-4 bg-gradient-to-r from-error-500 to-error-600 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-lg hover:shadow-xl transition-all"
        >
          Trigger Test Error
        </button>
      </div>
    </div>
  );
}
