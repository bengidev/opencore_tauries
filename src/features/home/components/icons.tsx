import type { ReactNode } from "react";

export type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx={7} cy={7} r={4.5} />
      <path d="m10.4 10.4 3.1 3.1" />
    </Icon>
  );
}

export function InboxIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M2.5 3.5h11v9h-11z" />
      <path d="M2.5 9.5H5.5l1 1.5h3l1-1.5h3.5" />
    </Icon>
  );
}

export function NoteIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3.5 2.5h6l3 3v8h-9z" />
      <path d="M9.5 2.5v3h3" />
    </Icon>
  );
}

export function AutomationsIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M9 2 4 9h3.2L7 14l5-7H8.6z" />
    </Icon>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M8 3v10M3 8h10" />
    </Icon>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M2.5 3.5h11L9.5 8.2v4.1L6.5 13.5V8.2z" />
    </Icon>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m4.5 6.5 3.5 3.5 3.5-3.5" />
    </Icon>
  );
}

export function BranchIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <circle cx={4} cy={3.5} r={1.5} />
      <circle cx={4} cy={12.5} r={1.5} />
      <circle cx={12} cy={3.5} r={1.5} />
      <path d="M4 5v6M12 5v1.5a3.5 3.5 0 0 1-3.5 3.5H4" />
    </Icon>
  );
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M8 13V3M4 7l4-4 4 4" />
    </Icon>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M13 8H3M7 4 3 8l4 4" />
    </Icon>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 8h10M9 4l4 4-4 4" />
    </Icon>
  );
}

export function PanelIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x={2.5} y={3} width={11} height={10} rx={1} />
      <path d="M6 3v10" />
    </Icon>
  );
}

export function CheckoutIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x={3.5} y={3.5} width={9} height={6.5} rx={1} />
      <path d="M2.5 12.5h11" />
    </Icon>
  );
}
