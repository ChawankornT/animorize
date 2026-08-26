"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  type Ref,
} from "react";
import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/Icon";

interface PopoverDivider {
  kind: "divider";
}

interface PopoverActionItemBase {
  kind: "item";
  label: string;
  onSelect: () => void;
  icon?: LucideIcon;
  checked?: boolean;
  destructive?: boolean;
  kbd?: string;
}

type PopoverActionItem =
  | (PopoverActionItemBase & { disabled?: false; disabledReason?: undefined })
  | (PopoverActionItemBase & { disabled: true; disabledReason: string });

export type PopoverItem = PopoverDivider | PopoverActionItem;

export interface PopoverTriggerProps {
  ref: Ref<HTMLButtonElement>;
  onClick: () => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>) => void;
  "aria-haspopup": "menu";
  "aria-expanded": boolean;
  "aria-controls": string;
}

interface PopoverProps {
  items: PopoverItem[];
  ariaLabel: string;
  align?: "start" | "end";
  renderTrigger: (props: PopoverTriggerProps) => ReactNode;
}

export function Popover({ items, ariaLabel, align = "end", renderTrigger }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);
  const pendingFocusRef = useRef<"first" | "last" | null>(null);
  const panelId = useId();

  const focusableIndices = items.reduce<number[]>((acc, item, i) => {
    if (item.kind === "item") acc.push(i);
    return acc;
  }, []);

  const focusItemAt = useCallback((index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.focus();
  }, []);

  const openMenu = useCallback((focusTarget: "first" | "last" = "first") => {
    pendingFocusRef.current = focusTarget;
    setOpen(true);
  }, []);

  const closeMenu = useCallback((returnFocus: boolean) => {
    setOpen(false);
    setActiveIndex(null);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Focus the requested item once the panel has mounted into the DOM.
  useEffect(() => {
    if (!open) return;
    const target = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (!target || focusableIndices.length === 0) return;
    const index =
      target === "first" ? focusableIndices[0] : focusableIndices[focusableIndices.length - 1];
    focusItemAt(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      closeMenu(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, closeMenu]);

  function moveFocus(delta: 1 | -1) {
    if (focusableIndices.length === 0) return;
    const currentPos = activeIndex !== null ? focusableIndices.indexOf(activeIndex) : -1;
    const nextPos = (currentPos + delta + focusableIndices.length) % focusableIndices.length;
    focusItemAt(focusableIndices[nextPos]);
  }

  function selectItem(index: number) {
    const item = items[index];
    if (!item || item.kind !== "item" || item.disabled) return;
    closeMenu(true);
    item.onSelect();
  }

  function handleTriggerKeyDown(e: ReactKeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openMenu("first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openMenu("last");
    }
  }

  function handlePanelKeyDown(e: ReactKeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveFocus(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(-1);
        break;
      case "Home":
        e.preventDefault();
        if (focusableIndices.length > 0) focusItemAt(focusableIndices[0]);
        break;
      case "End":
        e.preventDefault();
        if (focusableIndices.length > 0) focusItemAt(focusableIndices[focusableIndices.length - 1]);
        break;
      case "Escape":
        e.preventDefault();
        closeMenu(true);
        break;
      default:
        break;
    }
  }

  function handlePanelBlur(e: ReactFocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null;
    if (next && panelRef.current?.contains(next)) return;
    closeMenu(false);
  }

  // renderTrigger only forwards `ref` for JSX attachment (`ref={p.ref}` on the
  // consumer's button) — it never dereferences `.current` during render.
  // eslint-disable-next-line react-hooks/refs
  const trigger = renderTrigger({
    ref: triggerRef,
    onClick: () => (open ? closeMenu(true) : openMenu("first")),
    onKeyDown: handleTriggerKeyDown,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": panelId,
  });

  return (
    <div className="relative inline-block">
      {trigger}
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={ariaLabel}
          className={cn(
            "absolute top-[calc(100%+4px)] z-60 flex min-w-[200px] flex-col gap-0 p-1.5",
            "bg-page border-[0.5px] border-default rounded-card",
            align === "start" ? "left-0" : "right-0",
          )}
          onKeyDown={handlePanelKeyDown}
          onBlur={handlePanelBlur}
        >
          {items.map((item, i) => {
            if (item.kind === "divider") {
              return <div key={i} role="separator" className="h-[0.5px] my-1 bg-default" />;
            }

            const role = item.checked !== undefined ? "menuitemradio" : "menuitem";
            const tabIndex = activeIndex === i ? 0 : -1;
            const reasonId = item.disabled ? `${panelId}-reason-${i}` : undefined;
            const iconSlot = (
              <span className="flex w-4 h-4 shrink-0 items-center justify-center">
                {item.checked ? (
                  <Icon as={Check} size={16} />
                ) : (
                  item.icon && <Icon as={item.icon} size={16} />
                )}
              </span>
            );

            if (item.disabled) {
              return (
                <div
                  key={i}
                  ref={el => {
                    itemRefs.current[i] = el;
                  }}
                  role={role}
                  aria-disabled="true"
                  aria-checked={item.checked}
                  aria-describedby={reasonId}
                  tabIndex={tabIndex}
                  className={cn(
                    "flex items-start gap-2.5 rounded-md px-2.5 pt-[7px] pb-[9px] text-md text-secondary",
                    "cursor-default outline-none",
                    "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2",
                  )}
                >
                  {iconSlot}
                  <span className="flex flex-col gap-0.5">
                    <span>{item.label}</span>
                    <span id={reasonId} className="text-[12.5px] leading-snug text-secondary">
                      {item.disabledReason}
                    </span>
                  </span>
                </div>
              );
            }

            return (
              <button
                key={i}
                ref={el => {
                  itemRefs.current[i] = el;
                }}
                type="button"
                role={role}
                aria-checked={item.checked}
                tabIndex={tabIndex}
                onClick={() => selectItem(i)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-md font-normal text-left",
                  "bg-transparent border-none cursor-pointer outline-none",
                  "hover:bg-surface",
                  "focus-visible:outline-2 focus-visible:outline-focus focus-visible:outline-offset-2",
                  item.destructive ? "text-error" : "text-primary",
                )}
              >
                {iconSlot}
                <span className="flex-1">{item.label}</span>
                {item.kbd && <span className="ml-auto text-[11px] text-tertiary">{item.kbd}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
