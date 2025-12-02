"use client";

import * as React from "react";
import { X, Loader2, ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Drawer } from "../Drawer";
import { cn } from "@/lib/utils";

export interface EntityTab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
  content: React.ReactNode;
}

export interface EntityAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onClick: () => void;
  disabled?: boolean;
}

export interface EntityDrawerBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  entityType: string;
  entityId: string;
  isLoading?: boolean;
  error?: string | null;
  tabs: EntityTab[];
  actions?: EntityAction[];
  headerContent?: React.ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export function EntityDrawerBase({
  isOpen,
  onClose,
  title,
  subtitle,
  entityType,
  entityId,
  isLoading = false,
  error = null,
  tabs,
  actions = [],
  headerContent,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  size = "lg",
}: EntityDrawerBaseProps) {
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "");
  const [showActions, setShowActions] = React.useState(false);
  const actionsRef = React.useRef<HTMLDivElement>(null);

  // Reset tab on entity change
  React.useEffect(() => {
    if (entityId && tabs.length > 0) {
      setActiveTab(tabs[0].id);
    }
  }, [entityId, tabs]);

  // Close actions menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target as Node)) {
        setShowActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      position="right"
      size={size}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-start justify-between border-b px-6 py-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium uppercase text-muted-foreground">
                {entityType}
              </span>
              {(hasPrevious || hasNext) && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={!hasPrevious}
                    className={cn(
                      "rounded p-1 hover:bg-muted",
                      !hasPrevious && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!hasNext}
                    className={cn(
                      "rounded p-1 hover:bg-muted",
                      !hasNext && "opacity-30 cursor-not-allowed"
                    )}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            <h2 className="mt-1 text-lg font-semibold truncate">{title}</h2>
            {subtitle && (
              <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions.length > 0 && (
              <div className="relative" ref={actionsRef}>
                <button
                  type="button"
                  onClick={() => setShowActions(!showActions)}
                  className={cn(
                    "rounded-md border p-2 hover:bg-muted",
                    showActions && "bg-muted"
                  )}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {showActions && (
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[160px] rounded-md border bg-popover p-1 shadow-md">
                    {actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          action.onClick();
                          setShowActions(false);
                        }}
                        disabled={action.disabled}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm",
                          "hover:bg-accent hover:text-accent-foreground",
                          action.variant === "destructive" && "text-red-600 hover:text-red-600",
                          action.disabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border p-2 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Custom Header Content */}
        {headerContent && (
          <div className="border-b px-6 py-4">{headerContent}</div>
        )}

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex border-b px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium -mb-px",
                  "transition-colors",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center p-6">
              <div className="text-red-500 font-medium">Error loading {entityType}</div>
              <div className="text-sm text-muted-foreground">{error}</div>
            </div>
          ) : (
            <div className="p-6">{currentTab?.content}</div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

export default EntityDrawerBase;
