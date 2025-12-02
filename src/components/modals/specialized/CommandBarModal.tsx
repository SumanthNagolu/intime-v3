"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  Plus,
  User,
  Briefcase,
  Building,
  FileText,
  Calendar,
  Settings,
  Command,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  category: string;
  action: () => void;
  keywords?: string[];
}

interface RecentItem {
  id: string;
  label: string;
  type: string;
  icon?: React.ReactNode;
  action: () => void;
}

export interface CommandBarModalProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandItem[];
  recentItems?: RecentItem[];
  placeholder?: string;
  onSearch?: (query: string) => Promise<CommandItem[]>;
}

export function CommandBarModal({
  isOpen,
  onClose,
  commands,
  recentItems = [],
  placeholder = "Type a command or search...",
  onSearch,
}: CommandBarModalProps) {
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<CommandItem[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  // Reset state on open
  React.useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setSearchResults([]);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.description?.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.toLowerCase().includes(lowerQuery)) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  // Group filtered commands by category
  const groupedCommands = React.useMemo(() => {
    const displayItems = query.trim() ? [...filteredCommands, ...searchResults] : [];
    const groups: Record<string, CommandItem[]> = {};

    displayItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return groups;
  }, [filteredCommands, searchResults, query]);

  // Flat list for keyboard navigation
  const allItems = React.useMemo(() => {
    if (!query.trim()) {
      return recentItems.map((item) => ({
        ...item,
        category: "Recent",
        isRecent: true,
      }));
    }

    const items: Array<CommandItem & { isRecent?: boolean }> = [];
    Object.entries(groupedCommands).forEach(([_, categoryItems]) => {
      items.push(...categoryItems);
    });
    return items;
  }, [groupedCommands, recentItems, query]);

  // Handle async search
  React.useEffect(() => {
    const search = async () => {
      if (!query.trim() || !onSearch) return;

      setIsSearching(true);
      try {
        const results = await onSearch(query);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, onSearch]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        const selectedItem = allItems[selectedIndex];
        if (selectedItem) {
          selectedItem.action();
          onClose();
        }
        break;
      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  // Scroll selected item into view
  React.useEffect(() => {
    const selectedEl = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedEl?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[20%] z-50 w-full max-w-[640px] translate-x-[-50%]",
            "rounded-lg border bg-popover shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
          )}
          onKeyDown={handleKeyDown}
        >
          {/* Search Input */}
          <div className="flex items-center border-b px-4">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent px-3 py-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            {isSearching && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
            <kbd className="ml-2 hidden rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground sm:block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={listRef} className="max-h-[400px] overflow-auto p-2">
            {/* Empty State */}
            {allItems.length === 0 && query.trim() && !isSearching && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {/* Recent Items (when no query) */}
            {!query.trim() && recentItems.length > 0 && (
              <div className="pb-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Recent
                </div>
                {recentItems.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    data-index={index}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                      "hover:bg-accent",
                      selectedIndex === index && "bg-accent"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {item.icon || <Clock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.type}</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Actions (when no query) */}
            {!query.trim() && (
              <div className="border-t pt-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                  Quick Actions
                </div>
                <div className="grid gap-1">
                  {commands.slice(0, 6).map((cmd, index) => (
                    <button
                      key={cmd.id}
                      type="button"
                      data-index={recentItems.length + index}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                        "hover:bg-accent",
                        selectedIndex === recentItems.length + index && "bg-accent"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {cmd.icon || <Command className="h-4 w-4 text-muted-foreground" />}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-muted-foreground">{cmd.description}</div>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <div className="flex gap-1">
                          {cmd.shortcut.map((key) => (
                            <kbd
                              key={key}
                              className="rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {query.trim() &&
              Object.entries(groupedCommands).map(([category, items]) => (
                <div key={category} className="pb-2">
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {category}
                  </div>
                  {items.map((item) => {
                    const itemIndex = allItems.findIndex((i) => i.id === item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        data-index={itemIndex}
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm",
                          "hover:bg-accent",
                          selectedIndex === itemIndex && "bg-accent"
                        )}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                          {item.icon || <Command className="h-4 w-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground">{item.description}</div>
                          )}
                        </div>
                        {item.shortcut && (
                          <div className="flex gap-1">
                            {item.shortcut.map((key) => (
                              <kbd
                                key={key}
                                className="rounded border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                              >
                                {key}
                              </kbd>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span>Navigate:</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">↑↓</kbd>
            </div>
            <div className="flex items-center gap-2">
              <span>Select:</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Enter</kbd>
            </div>
            <div className="flex items-center gap-2">
              <span>Close:</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5">Esc</kbd>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default CommandBarModal;
