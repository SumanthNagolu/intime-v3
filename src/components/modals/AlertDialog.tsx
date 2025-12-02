"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  AlertOctagon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type AlertVariant = "info" | "warning" | "error" | "success" | "critical";

const variantConfig: Record<
  AlertVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClassName: string;
    bgClassName: string;
  }
> = {
  info: {
    icon: Info,
    iconClassName: "text-blue-500",
    bgClassName: "bg-blue-100",
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-yellow-500",
    bgClassName: "bg-yellow-100",
  },
  error: {
    icon: AlertCircle,
    iconClassName: "text-red-500",
    bgClassName: "bg-red-100",
  },
  success: {
    icon: CheckCircle,
    iconClassName: "text-green-500",
    bgClassName: "bg-green-100",
  },
  critical: {
    icon: AlertOctagon,
    iconClassName: "text-red-600",
    bgClassName: "bg-red-200",
  },
};

export interface AlertDialogProps {
  isOpen: boolean;
  onAcknowledge: () => void;
  title: string;
  message: string;
  variant?: AlertVariant;
  acknowledgeText?: string;
}

export function AlertDialog({
  isOpen,
  onAcknowledge,
  title,
  message,
  variant = "info",
  acknowledgeText = "OK",
}: AlertDialogProps) {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  return (
    <AlertDialogPrimitive.Root open={isOpen}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <AlertDialogPrimitive.Content
          // Prevent closing via escape key for non-dismissible alerts
          onEscapeKeyDown={(e) => e.preventDefault()}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "sm:rounded-lg"
          )}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full",
                config.bgClassName
              )}
            >
              <IconComponent className={cn("h-6 w-6", config.iconClassName)} />
            </div>
            <AlertDialogPrimitive.Title className="mt-4 text-lg font-semibold">
              {title}
            </AlertDialogPrimitive.Title>
            <AlertDialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
              {message}
            </AlertDialogPrimitive.Description>
          </div>

          <div className="flex justify-center">
            <AlertDialogPrimitive.Action
              onClick={onAcknowledge}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-8 py-2",
                "bg-primary text-sm font-medium text-primary-foreground",
                "ring-offset-background transition-colors",
                "hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              )}
            >
              {acknowledgeText}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export default AlertDialog;
