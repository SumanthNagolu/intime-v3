"use client";

import { useState, useCallback, useContext, createContext } from "react";

export type ConfirmVariant = "info" | "warning" | "danger" | "success";

export interface ConfirmOptions {
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve: ((value: boolean) => void) | null;
}

const defaultState: ConfirmState = {
  isOpen: false,
  title: "",
  message: "",
  variant: "warning",
  confirmText: "Confirm",
  cancelText: "Cancel",
  resolve: null,
};

/**
 * Confirmation dialog hook
 * Returns a function that can be called to show a confirmation dialog
 * and returns a promise that resolves to true/false based on user action
 */
export function useConfirmState() {
  const [state, setState] = useState<ConfirmState>(defaultState);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        ...options,
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState(defaultState);
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState(defaultState);
  }, [state.resolve]);

  return {
    state,
    confirm,
    handleConfirm,
    handleCancel,
  };
}

/**
 * Confirmation dialog context for global usage
 */
export interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextValue | null>(null);

/**
 * Hook to use the global confirm dialog
 * Must be used within a ConfirmProvider
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
}

/**
 * Destructive action confirmation helper
 * Pre-configured for delete/remove actions
 */
export function useDeleteConfirm() {
  const confirm = useConfirm();

  return useCallback(
    async (entityName: string, entityType = "item") => {
      return confirm({
        title: `Delete ${entityType}?`,
        message: `Are you sure you want to delete "${entityName}"? This action cannot be undone.`,
        variant: "danger",
        confirmText: "Delete",
        cancelText: "Cancel",
      });
    },
    [confirm]
  );
}

/**
 * Unsaved changes confirmation helper
 */
export function useUnsavedChangesConfirm() {
  const confirm = useConfirm();

  return useCallback(async () => {
    return confirm({
      title: "Unsaved Changes",
      message:
        "You have unsaved changes. Are you sure you want to leave? Your changes will be lost.",
      variant: "warning",
      confirmText: "Leave",
      cancelText: "Stay",
    });
  }, [confirm]);
}

export default useConfirm;
