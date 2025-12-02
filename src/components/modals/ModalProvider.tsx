"use client";

import * as React from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import {
  ConfirmContext,
  useConfirmState,
  type ConfirmOptions,
} from "./hooks/useConfirm";

interface ModalStackItem {
  id: string;
  zIndex: number;
}

interface ModalStackContextValue {
  stack: ModalStackItem[];
  push: (id: string) => number;
  pop: (id: string) => void;
  getZIndex: (id: string) => number;
}

const ModalStackContext = React.createContext<ModalStackContextValue | null>(null);

const BASE_Z_INDEX = 50;

/**
 * Provider for managing modal z-index stacking
 * Ensures modals opened on top of other modals appear correctly
 */
export function ModalStackProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = React.useState<ModalStackItem[]>([]);

  const push = React.useCallback((id: string) => {
    const zIndex = BASE_Z_INDEX + stack.length * 10;
    setStack((prev) => [...prev, { id, zIndex }]);
    return zIndex;
  }, [stack.length]);

  const pop = React.useCallback((id: string) => {
    setStack((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const getZIndex = React.useCallback(
    (id: string) => {
      const item = stack.find((item) => item.id === id);
      return item?.zIndex ?? BASE_Z_INDEX;
    },
    [stack]
  );

  // Prevent body scroll when any modal is open
  React.useEffect(() => {
    if (stack.length > 0) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [stack.length]);

  // Handle escape key for top-most modal only
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && stack.length > 0) {
        // The topmost modal should handle its own escape
        // This is just for tracking purposes
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [stack]);

  return (
    <ModalStackContext.Provider value={{ stack, push, pop, getZIndex }}>
      {children}
    </ModalStackContext.Provider>
  );
}

/**
 * Hook to manage modal in the stack
 */
export function useModalStack(id: string) {
  const context = React.useContext(ModalStackContext);
  if (!context) {
    throw new Error("useModalStack must be used within a ModalStackProvider");
  }

  const { push, pop, getZIndex } = context;

  const register = React.useCallback(() => push(id), [id, push]);
  const unregister = React.useCallback(() => pop(id), [id, pop]);
  const zIndex = getZIndex(id);

  return { register, unregister, zIndex };
}

/**
 * Provider for the confirmation dialog system
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const { state, confirm, handleConfirm, handleCancel } = useConfirmState();

  const contextValue = React.useMemo(
    () => ({
      confirm,
    }),
    [confirm]
  );

  return (
    <ConfirmContext.Provider value={contextValue}>
      {children}
      <ConfirmDialog
        isOpen={state.isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        title={state.title}
        message={state.message}
        variant={state.variant}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
      />
    </ConfirmContext.Provider>
  );
}

/**
 * Combined modal provider
 * Provides both modal stacking and confirmation dialog features
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  return (
    <ModalStackProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ModalStackProvider>
  );
}

export default ModalProvider;
