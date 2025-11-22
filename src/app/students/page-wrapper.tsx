/**
 * Page Wrapper - Adds padding for pages that need it
 */

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="p-8 h-full overflow-auto">{children}</div>;
}

