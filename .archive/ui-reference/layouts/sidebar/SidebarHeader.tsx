'use client';

import React from 'react';

/**
 * Sidebar header component
 * Displays "Workspace" title
 * Height: 48px with bottom border
 */
export function SidebarHeader() {
  return (
    <div className="h-12 px-4 flex items-center border-b border-border">
      <span className="font-semibold text-sm text-charcoal">Workspace</span>
    </div>
  );
}
