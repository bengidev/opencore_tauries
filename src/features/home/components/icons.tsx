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

export function CheckIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m3 8.5 3.2 3.2L13 5" />
    </Icon>
  );
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m4.5 4.5 7 7M11.5 4.5l-7 7" />
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

export function SparkleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M8 1.8c.55 2.6 1.3 3.35 3.9 3.9-2.6.55-3.35 1.3-3.9 3.9-.55-2.6-1.3-3.35-3.9-3.9 2.6-.55 3.35-1.3 3.9-3.9ZM12.1 9.6c.28 1.3.65 1.67 1.95 1.95-1.3.28-1.67.65-1.95 1.95-.28-1.3-.65-1.67-1.95-1.95 1.3-.28 1.67-.65 1.95-1.95Z" />
    </svg>
  );
}

export function GaugeIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M2.9 11.3a6 6 0 1 1 10.2 0" />
      <path d="M8 8.7 10.1 6.4" />
      <circle cx="8" cy="8.8" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <rect x={3.5} y={7} width={9} height={6} rx={1.5} />
      <path d="M5.6 7V5.4a2.4 2.4 0 0 1 4.8 0V7" />
    </Icon>
  );
}

export function PaperclipIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12.7 7.2 7.6 12.3a3.3 3.3 0 0 1-4.7-4.7l5.5-5.5a2.2 2.2 0 0 1 3.1 3.1l-5.5 5.5a1.1 1.1 0 0 1-1.6-1.6l5-5" />
    </Icon>
  );
}
