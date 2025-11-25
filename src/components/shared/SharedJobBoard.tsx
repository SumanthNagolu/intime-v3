'use client';

import React from 'react';
import { JobBoard } from './JobBoard';

/**
 * SharedJobBoard - Wrapper component for the shared job board
 * Uses the JobBoard component under the hood
 */
export const SharedJobBoard: React.FC = () => {
  return <JobBoard />;
};
