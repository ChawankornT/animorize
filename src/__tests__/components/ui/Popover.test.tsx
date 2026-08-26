// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Edit, Trash2 } from "lucide-react";
import { Popover, type PopoverItem } from "@/components/ui/Popover";

afterEach(() => cleanup());

function renderPopover(items: PopoverItem[]) {
  return render(
    <Popover
      items={items}
      ariaLabel="More actions"
      renderTrigger={p => (
        <button
          ref={p.ref}
          onClick={p.onClick}
          onKeyDown={p.onKeyDown}
          aria-haspopup={p["aria-haspopup"]}
          aria-expanded={p["aria-expanded"]}
          aria-controls={p["aria-controls"]}
        >
          More
        </button>
      )}
    />,
  );
}

describe("Popover", () => {
  it("should focus the first item when opened via keyboard ArrowDown", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderPopover([{ kind: "item", label: "Edit progress", onSelect, icon: Edit }]);

    const trigger = screen.getByRole("button", { name: "More" });
    trigger.focus();
    await user.keyboard("{ArrowDown}");

    await waitFor(() => {
      expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Edit progress" }));
    });
  });

  it("should let arrow navigation reach a disabled item and expose its reason via aria-describedby", async () => {
    const user = userEvent.setup();
    renderPopover([
      {
        kind: "item",
        label: "Edit progress",
        onSelect: vi.fn(),
        disabled: true,
        disabledReason: "Episode count not set",
      },
      { kind: "divider" },
      { kind: "item", label: "Remove from library", onSelect: vi.fn(), destructive: true },
    ]);

    await user.click(screen.getByRole("button", { name: "More" }));

    const disabledItem = await screen.findByRole("menuitem", { name: /Edit progress/ });
    await waitFor(() => expect(document.activeElement).toBe(disabledItem));
    expect(disabledItem.getAttribute("aria-disabled")).toBe("true");
    const describedBy = disabledItem.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toContain("Episode count not set");

    await user.keyboard("{ArrowDown}");
    const removeItem = screen.getByRole("menuitem", { name: "Remove from library" });
    await waitFor(() => expect(document.activeElement).toBe(removeItem));
  });

  it("should not call onSelect when Enter, Space, or click happen on a disabled item", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderPopover([
      {
        kind: "item",
        label: "Edit progress",
        onSelect,
        disabled: true,
        disabledReason: "Episode count not set",
      },
    ]);

    await user.click(screen.getByRole("button", { name: "More" }));
    const disabledItem = await screen.findByRole("menuitem", { name: /Edit progress/ });
    await waitFor(() => expect(document.activeElement).toBe(disabledItem));

    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(disabledItem);

    expect(onSelect).not.toHaveBeenCalled();
  });

  it("should close and return focus to the trigger on Escape", async () => {
    const user = userEvent.setup();
    renderPopover([{ kind: "item", label: "Remove from library", onSelect: vi.fn() }]);

    const trigger = screen.getByRole("button", { name: "More" });
    await user.click(trigger);
    await screen.findByRole("menu");

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("menu")).toBeNull();
      expect(document.activeElement).toBe(trigger);
    });
  });

  it("should apply the destructive class to a destructive item", async () => {
    const user = userEvent.setup();
    renderPopover([
      { kind: "item", label: "Remove from library", onSelect: vi.fn(), destructive: true },
    ]);

    await user.click(screen.getByRole("button", { name: "More" }));
    const item = await screen.findByRole("menuitem", { name: "Remove from library" });
    expect(item.className).toContain("text-error");
  });

  it("should render a fixed icon slot even when an item has no icon", async () => {
    const user = userEvent.setup();
    renderPopover([
      { kind: "item", label: "Has icon", onSelect: vi.fn(), icon: Trash2 },
      { kind: "item", label: "No icon", onSelect: vi.fn() },
    ]);

    await user.click(screen.getByRole("button", { name: "More" }));
    const noIconItem = await screen.findByRole("menuitem", { name: "No icon" });
    expect(noIconItem.querySelector("span")).not.toBeNull();
  });

  it("should give a checked item role=menuitemradio and matching aria-checked", async () => {
    const user = userEvent.setup();
    renderPopover([
      { kind: "item", label: "Recently active", onSelect: vi.fn(), checked: true },
      { kind: "item", label: "Recently added", onSelect: vi.fn(), checked: false },
    ]);

    await user.click(screen.getByRole("button", { name: "More" }));
    const checkedItem = await screen.findByRole("menuitemradio", { name: "Recently active" });
    expect(checkedItem.getAttribute("aria-checked")).toBe("true");
    const uncheckedItem = screen.getByRole("menuitemradio", { name: "Recently added" });
    expect(uncheckedItem.getAttribute("aria-checked")).toBe("false");
  });
});
