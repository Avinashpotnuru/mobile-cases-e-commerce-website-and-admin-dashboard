import type { ReactNode, SVGProps } from "react";

type AdminIconProps = SVGProps<SVGSVGElement>;

function IconBase({
  children,
  ...props
}: AdminIconProps & { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

export function DashboardIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </IconBase>
  );
}

export function TagIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M12.6 2.9 20 10.3a2 2 0 0 1 0 2.8l-6.9 6.9a2 2 0 0 1-2.8 0L3 12.9V3.9a1 1 0 0 1 1-1h8.6Z" />
      <circle cx="8" cy="8" r="1.4" />
    </IconBase>
  );
}

export function TicketIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 9V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a3 3 0 0 0 0 6v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a3 3 0 0 0 0-6Z" />
      <path d="M15 5h.01" />
      <path d="M15 19h.01" />
    </IconBase>
  );
}

export function SmartphoneIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M10 18.5h4" />
    </IconBase>
  );
}

export function LayersIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 16.5 9 5 9-5" />
    </IconBase>
  );
}

export function PackageIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </IconBase>
  );
}

export function BagIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </IconBase>
  );
}

export function ReceiptIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
      <path d="M8 15h4" />
    </IconBase>
  );
}

export function ChartBarIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </IconBase>
  );
}

export function WalletIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v2" />
      <path d="M3 6v11a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" />
      <path d="M16 12.5h.01" />
    </IconBase>
  );
}

export function PackageCheckIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M21 12.5V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 .9.2" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
      <path d="m15 18.5 2 2 4-4" />
    </IconBase>
  );
}

export function AlertIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </IconBase>
  );
}

export function ExternalLinkIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </IconBase>
  );
}

export function MenuIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </IconBase>
  );
}

export function ChevronRightIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="m9 5 7 7-7 7" />
    </IconBase>
  );
}

export function ChevronLeftIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="m15 5-7 7 7 7" />
    </IconBase>
  );
}

export function ArrowUpRightIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </IconBase>
  );
}

export function CloseIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </IconBase>
  );
}

export function ArrowUpDownIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </IconBase>
  );
}

export function ChevronUpIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="m18 15-6-6-6 6" />
    </IconBase>
  );
}

export function ChevronDownIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <path d="m6 9 6 6 6-6" />
    </IconBase>
  );
}

export function SearchIcon(props: AdminIconProps) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </IconBase>
  );
}