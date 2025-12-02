"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { X, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export type DrawerPosition = "left" | "right";
export type DrawerSize = "sm" | "md" | "lg" | "xl" | "full";

const sizeClasses: Record<DrawerSize, string> = {
  sm: "w-[320px]",
  md: "w-[400px]",
  lg: "w-[500px]",
  xl: "w-[640px]",
  full: "w-[100vw]",
};

export interface TabConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface ActionConfig {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "primary" | "destructive" | "secondary";
  disabled?: boolean;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  position?: DrawerPosition;
  size?: DrawerSize;
  tabs?: TabConfig[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  actions?: ActionConfig[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  showResizeHandle?: boolean;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  position = "right",
  size = "md",
  tabs,
  activeTab,
  onTabChange,
  actions,
  children,
  footer,
  showResizeHandle = false,
  className,
}: DrawerProps) {
  const [currentSize, setCurrentSize] = React.useState(size);
  const [isResizing, setIsResizing] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  const positionClasses = {
    left: "inset-y-0 left-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left",
    right: "inset-y-0 right-0 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
  };

  return (
    <SheetPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <SheetPrimitive.Portal>
        <SheetPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <SheetPrimitive.Content
          className={cn(
            "fixed z-50 flex h-full flex-col gap-0 bg-background shadow-lg",
            "transition ease-in-out",
            "data-[state=closed]:duration-300 data-[state=open]:duration-500",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            positionClasses[position],
            sizeClasses[currentSize],
            className
          )}
        >
          {/* Resize Handle */}
          {showResizeHandle && position === "right" && (
            <div
              className="absolute left-0 top-0 h-full w-1 cursor-ew-resize hover:bg-primary/20"
              onMouseDown={() => setIsResizing(true)}
            >
              <GripVertical className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col border-b px-6 py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <SheetPrimitive.Title className="text-lg font-semibold text-foreground">
                  {title}
                </SheetPrimitive.Title>
                {subtitle && (
                  <SheetPrimitive.Description className="mt-1 text-sm text-muted-foreground">
                    {subtitle}
                  </SheetPrimitive.Description>
                )}
              </div>
              <SheetPrimitive.Close
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </SheetPrimitive.Close>
            </div>

            {/* Actions Toolbar */}
            {actions && actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                      "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      action.variant === "primary" &&
                        "bg-primary text-primary-foreground hover:bg-primary/90",
                      action.variant === "destructive" &&
                        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                      action.variant === "secondary" &&
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                      (!action.variant || action.variant === "default") &&
                        "border bg-background hover:bg-accent hover:text-accent-foreground",
                      action.disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {action.icon}
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Tabs */}
            {tabs && tabs.length > 0 && (
              <div className="mt-4 flex gap-1 border-b -mb-4 -mx-6 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                    {tab.badge !== undefined && (
                      <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="sticky bottom-0 border-t bg-background px-6 py-4">
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                {footer}
              </div>
            </div>
          )}
        </SheetPrimitive.Content>
      </SheetPrimitive.Portal>
    </SheetPrimitive.Root>
  );
}

// Sub-components
export const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);

export const DrawerBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-auto", className)} {...props} />
);

export const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);

export default Drawer;
