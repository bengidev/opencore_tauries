import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

import type { ComposerOption } from "../composer-options";
import { optionLabel } from "../composer-options";
import { CheckIcon, ChevronDownIcon } from "./icons";

export type PopoverMenuProps = {
  label: string;
  value: string;
  options: ComposerOption[];
  onChange: (id: string) => void;
  dot?: boolean;
  chevron?: boolean;
  className?: string;
};

const MENU_ITEM = '[role="menuitemradio"]';

export default function PopoverMenu({
  label,
  value,
  options,
  onChange,
  dot = false,
  chevron = true,
  className,
}: PopoverMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    menuRef.current?.querySelector<HTMLButtonElement>(MENU_ITEM)?.focus({ preventScroll: true });

    function handlePointerDown(event: PointerEvent): void {
      if (!wrapRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape") return;
      // Home listens on window for the drawer; a menu Escape must not close both.
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus({ preventScroll: true });
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  function focusItem(delta: number | "first" | "last"): void {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>(MENU_ITEM) ?? []);
    if (items.length === 0) return;

    const current = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      delta === "first"
        ? 0
        : delta === "last"
          ? items.length - 1
          : (current + delta + items.length) % items.length;

    items[next].focus({ preventScroll: true });
  }

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>): void {
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key === "Home" ? "first" : event.key === "End" ? "last" : null;
    if (step === null) return;

    event.preventDefault();
    focusItem(step);
  }

  function handleTriggerKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>): void {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    setOpen(true);
  }

  function select(id: string): void {
    onChange(id);
    setOpen(false);
    triggerRef.current?.focus({ preventScroll: true });
  }

  const currentLabel = optionLabel(options, value);

  return (
    <div
      className={`home-composer-menu-wrap${className ? ` ${className}` : ""}`}
      ref={wrapRef}
      onBlur={(event) => {
        // Tabbing out of the trigger/menu pair should not leave it hanging open.
        if (!wrapRef.current?.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="home-composer-pill home-composer-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${label}: ${currentLabel}`}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={handleTriggerKeyDown}
      >
        {dot ? <span className="home-composer-dot" aria-hidden="true" /> : null}
        <span className="home-composer-trigger-label">{currentLabel}</span>
        {chevron ? <ChevronDownIcon className="home-composer-chevron" /> : null}
      </button>

      {open ? (
        <div
          ref={menuRef}
          className="home-composer-menu"
          role="menu"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              role="menuitemradio"
              aria-checked={option.id === value}
              className="home-composer-menu-item"
              onClick={() => select(option.id)}
            >
              <span>{option.label}</span>
              <CheckIcon className="home-composer-menu-check" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
