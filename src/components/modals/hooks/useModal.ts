"use client";

import { useState, useCallback } from "react";

/**
 * Basic modal state hook
 * @returns Modal state and controls
 */
export function useModal(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

/**
 * Modal state hook with data payload
 * Useful for edit modals that need to receive entity data
 */
export function useModalWithData<T = unknown>(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback((initialData?: T) => {
    if (initialData !== undefined) {
      setData(initialData);
    }
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay clearing data to allow close animation
    setTimeout(() => setData(null), 300);
  }, []);

  const toggle = useCallback(
    (initialData?: T) => {
      if (!isOpen && initialData !== undefined) {
        setData(initialData);
      }
      setIsOpen((prev) => !prev);
    },
    [isOpen]
  );

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setData,
    setIsOpen,
  };
}

/**
 * Multi-step modal/wizard state hook
 */
export function useWizardModal<T = unknown>(
  totalSteps: number,
  defaultOpen = false
) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<Partial<T>>({});

  const open = useCallback((initialData?: Partial<T>) => {
    if (initialData !== undefined) {
      setData(initialData);
    }
    setCurrentStep(1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Delay reset to allow close animation
    setTimeout(() => {
      setCurrentStep(1);
      setData({});
    }, 300);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(1, Math.min(step, totalSteps)));
    },
    [totalSteps]
  );

  const updateData = useCallback((updates: Partial<T>) => {
    setData((prev) => ({ ...prev, ...updates }));
  }, []);

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  const progress = (currentStep / totalSteps) * 100;

  return {
    isOpen,
    currentStep,
    totalSteps,
    data,
    isFirstStep,
    isLastStep,
    progress,
    open,
    close,
    nextStep,
    prevStep,
    goToStep,
    setData,
    updateData,
    setIsOpen,
  };
}

export default useModal;
