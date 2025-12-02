"use client";

import * as React from "react";
import { Loader2, Plus, Search, Check, List, GripVertical } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface Hotlist {
  id: string;
  name: string;
  description?: string;
  consultantCount: number;
}

interface Consultant {
  id: string;
  name: string;
  title: string;
  skills: string[];
}

interface AddToHotlistFormData {
  hotlistId: string;
  createNew: boolean;
  newHotlistName?: string;
  newHotlistDescription?: string;
  position?: number;
}

export interface AddToHotlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: Consultant;
  existingHotlists: Hotlist[];
  onSubmit: (data: AddToHotlistFormData) => Promise<void>;
  onCreateHotlist?: (name: string, description?: string) => Promise<Hotlist>;
}

export function AddToHotlistModal({
  isOpen,
  onClose,
  consultant,
  existingHotlists,
  onSubmit,
  onCreateHotlist,
}: AddToHotlistModalProps) {
  const [formData, setFormData] = React.useState<AddToHotlistFormData>({
    hotlistId: "",
    createNew: false,
  });
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        hotlistId: "",
        createNew: false,
      });
      setSearchQuery("");
    }
  }, [isOpen]);

  const filteredHotlists = existingHotlists.filter((hl) =>
    hl.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectHotlist = (hotlistId: string) => {
    setFormData((prev) => ({
      ...prev,
      hotlistId,
      createNew: false,
    }));
  };

  const handleToggleCreateNew = () => {
    setFormData((prev) => ({
      ...prev,
      createNew: !prev.createNew,
      hotlistId: "",
    }));
  };

  const handleCreateAndAdd = async () => {
    if (!formData.newHotlistName || !onCreateHotlist) return;

    setIsCreating(true);
    try {
      const newHotlist = await onCreateHotlist(
        formData.newHotlistName,
        formData.newHotlistDescription
      );
      setFormData((prev) => ({
        ...prev,
        hotlistId: newHotlist.id,
        createNew: false,
      }));
    } catch (error) {
      console.error("Failed to create hotlist:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const isFormValid = (): boolean => {
    if (formData.createNew) {
      return Boolean(formData.newHotlistName && formData.newHotlistName.length >= 3);
    }
    return Boolean(formData.hotlistId);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to add to hotlist:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add to Hotlist"
      subtitle={consultant.name}
      size="md"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md border border-input",
              "bg-background px-4 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Add to Hotlist
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Consultant Preview */}
        <div className="rounded-md border bg-muted/50 p-3">
          <div className="font-medium">{consultant.name}</div>
          <div className="text-sm text-muted-foreground">{consultant.title}</div>
          <div className="mt-2 flex flex-wrap gap-1">
            {consultant.skills.slice(0, 5).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-background px-2 py-0.5 text-xs"
              >
                {skill}
              </span>
            ))}
            {consultant.skills.length > 5 && (
              <span className="text-xs text-muted-foreground">
                +{consultant.skills.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Create New Option */}
        <button
          type="button"
          onClick={handleToggleCreateNew}
          className={cn(
            "flex w-full items-center gap-3 rounded-md border border-dashed p-3",
            "text-left transition-colors hover:bg-muted/50",
            formData.createNew && "border-primary bg-primary/10"
          )}
        >
          <Plus className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm font-medium">Create new hotlist</span>
        </button>

        {formData.createNew && (
          <div className="space-y-3 rounded-md border p-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Hotlist Name *</label>
              <input
                type="text"
                value={formData.newHotlistName || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newHotlistName: e.target.value }))
                }
                placeholder="e.g., Java Developers - December 2024"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={formData.newHotlistDescription || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newHotlistDescription: e.target.value,
                  }))
                }
                placeholder="Brief description of this hotlist..."
                className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            {onCreateHotlist && (
              <button
                type="button"
                onClick={handleCreateAndAdd}
                disabled={isCreating || !formData.newHotlistName}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-2 rounded-md",
                  "bg-secondary px-3 py-1 text-sm font-medium",
                  "hover:bg-secondary/80",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              >
                {isCreating && <Loader2 className="h-3 w-3 animate-spin" />}
                Create Hotlist First
              </button>
            )}
          </div>
        )}

        {/* Existing Hotlists */}
        {!formData.createNew && (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search hotlists..."
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
              />
            </div>

            <div className="max-h-[200px] space-y-1 overflow-auto">
              {filteredHotlists.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No hotlists found
                </p>
              ) : (
                filteredHotlists.map((hotlist) => (
                  <button
                    key={hotlist.id}
                    type="button"
                    onClick={() => handleSelectHotlist(hotlist.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border p-3 text-left",
                      "transition-colors hover:bg-muted/50",
                      formData.hotlistId === hotlist.id && "border-primary bg-primary/10"
                    )}
                  >
                    <List className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{hotlist.name}</div>
                      {hotlist.description && (
                        <div className="text-xs text-muted-foreground">
                          {hotlist.description}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {hotlist.consultantCount} consultants
                    </span>
                    {formData.hotlistId === hotlist.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))
              )}
            </div>
          </>
        )}

        {/* Position in List */}
        {formData.hotlistId && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Position in List</label>
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <input
                type="number"
                value={formData.position || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    position: parseInt(e.target.value) || undefined,
                  }))
                }
                placeholder="Auto (end of list)"
                min={1}
                className="h-10 w-32 rounded-md border border-input bg-background px-3 text-sm"
              />
              <span className="text-sm text-muted-foreground">
                Leave empty to add at the end
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default AddToHotlistModal;
