'use client';

import React from 'react';
import { TalentBoard } from './TalentBoard';

/**
 * SharedTalentPool - Wrapper component for the shared talent pool
 * Uses the TalentBoard component under the hood
 */
export const SharedTalentPool: React.FC = () => {
  return <TalentBoard />;
};
