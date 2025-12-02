"use client";

import { useState, useCallback } from "react";

export type EntityType =
  | "job"
  | "candidate"
  | "submission"
  | "account"
  | "contact"
  | "lead"
  | "deal"
  | "activity"
  | "consultant"
  | "employee"
  | "vendor"
  | "placement"
  | "interview";

export interface EntityDrawerState {
  isOpen: boolean;
  entityType: EntityType | null;
  entityId: string | null;
}

/**
 * Entity drawer state hook
 * Used for detail drawers that show entity information
 */
export function useEntityDrawer() {
  const [state, setState] = useState<EntityDrawerState>({
    isOpen: false,
    entityType: null,
    entityId: null,
  });

  const open = useCallback((entityType: EntityType, entityId: string) => {
    setState({
      isOpen: true,
      entityType,
      entityId,
    });
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
    }));
    // Delay clearing entity data to allow close animation
    setTimeout(() => {
      setState({
        isOpen: false,
        entityType: null,
        entityId: null,
      });
    }, 300);
  }, []);

  return {
    ...state,
    open,
    close,
  };
}

/**
 * Drawer state hook with tabs
 */
export function useDrawerWithTabs<T = unknown>(
  defaultTab: string,
  defaultOpen = false
) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [data, setData] = useState<T | null>(null);

  const open = useCallback(
    (initialData?: T, initialTab?: string) => {
      if (initialData !== undefined) {
        setData(initialData);
      }
      if (initialTab) {
        setActiveTab(initialTab);
      } else {
        setActiveTab(defaultTab);
      }
      setIsOpen(true);
    },
    [defaultTab]
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setData(null);
      setActiveTab(defaultTab);
    }, 300);
  }, [defaultTab]);

  const changeTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
  }, []);

  return {
    isOpen,
    activeTab,
    data,
    open,
    close,
    changeTab,
    setData,
    setActiveTab,
    setIsOpen,
  };
}

/**
 * URL-synced drawer state for deep linking
 */
export function useUrlSyncedDrawer(
  paramName = "drawer",
  entityParamName = "entity"
) {
  const [state, setState] = useState<EntityDrawerState>({
    isOpen: false,
    entityType: null,
    entityId: null,
  });

  // Sync state with URL on open
  const open = useCallback(
    (entityType: EntityType, entityId: string) => {
      setState({
        isOpen: true,
        entityType,
        entityId,
      });

      // Update URL without navigation
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set(paramName, entityType);
        url.searchParams.set(entityParamName, entityId);
        window.history.pushState({}, "", url.toString());
      }
    },
    [paramName, entityParamName]
  );

  const close = useCallback(() => {
    setState({
      isOpen: false,
      entityType: null,
      entityId: null,
    });

    // Remove URL params
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete(paramName);
      url.searchParams.delete(entityParamName);
      window.history.pushState({}, "", url.toString());
    }
  }, [paramName, entityParamName]);

  return {
    ...state,
    open,
    close,
  };
}

export default useEntityDrawer;
