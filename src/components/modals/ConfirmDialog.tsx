"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "info" | "warning" | "danger" | "success";

const variantConfig: Record<
  ConfirmVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    iconClassName: string;
    buttonClassName: string;
  }
> = {
  info: {
    icon: Info,
    iconClassName: "text-blue-500",
    buttonClassName: "bg-blue-600 hover:bg-blue-700",
  },
  warning: {
    icon: AlertTriangle,
    iconClassName: "text-yellow-500",
    buttonClassName: "bg-yellow-600 hover:bg-yellow-700",
  },
  danger: {
    icon: AlertCircle,
    iconClassName: "text-red-500",
    buttonClassName: "bg-red-600 hover:bg-red-700 text-white",
  },
  success: {
    icon: CheckCircle,
    iconClassName: "text-green-500",
    buttonClassName: "bg-green-600 hover:bg-green-700",
  },
};

export interface ConfirmDialogProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title: string;
  message: string;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  variant = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = React.useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setIsSubmitting(false);
    }
  }, [onConfirm]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isSubmitting && !loading) {
        e.preventDefault();
        handleConfirm();
      }
    },
    [handleConfirm, isSubmitting, loading]
  );

  const isLoading = loading || isSubmitting;

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
          onKeyDown={handleKeyDown}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "gap-4 border bg-background p-6 shadow-lg duration-200",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            "sm:rounded-lg"
          )}
        >
          <div className="flex gap-4">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                variant === "danger" && "bg-red-100",
                variant === "warning" && "bg-yellow-100",
                variant === "success" && "bg-green-100",
                variant === "info" && "bg-blue-100"
              )}
            >
              <IconComponent className={cn("h-5 w-5", config.iconClassName)} />
            </div>
            <div className="flex-1">
              <AlertDialogPrimitive.Title className="text-lg font-semibold">
                {title}
              </AlertDialogPrimitive.Title>
              <AlertDialogPrimitive.Description className="mt-2 text-sm text-muted-foreground">
                {message}
              </AlertDialogPrimitive.Description>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <AlertDialogPrimitive.Cancel
              onClick={onCancel}
              disabled={isLoading}
              className={cn(
                "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input",
                "bg-background px-4 py-2 text-sm font-medium ring-offset-background",
                "transition-colors hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                "sm:mt-0"
              )}
            >
              {cancelText}
            </AlertDialogPrimitive.Cancel>
            <AlertDialogPrimitive.Action
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "inline-flex h-10 items-center justify-center rounded-md px-4 py-2",
                "text-sm font-medium text-white ring-offset-background",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50",
                config.buttonClassName
              )}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {confirmText}
            </AlertDialogPrimitive.Action>
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}

export default ConfirmDialog;
