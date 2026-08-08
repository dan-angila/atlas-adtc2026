/** Minimal inline SVG icon set — no icon-font/library dependency for a
 * handful of glyphs (per the project's "no huge UI dependency stack
 * unnecessarily" standard). Stroke-based, 20x20 viewBox, inherits
 * currentColor so they follow text/badge color automatically. */

import type { SVGProps } from "react";

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      width="1em"
      height="1em"
      {...props}
    />
  );
}

export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 5.5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H8l-3.5 3v-3H5a2 2 0 0 1-2-2v-6Z" />
    </Icon>
  );
}

export function BookIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H10v14H5.5A1.5 1.5 0 0 0 4 18.5v-14Z" />
      <path d="M16 4.5A1.5 1.5 0 0 0 14.5 3H10v14h4.5a1.5 1.5 0 0 1 1.5 1.5v-14Z" />
    </Icon>
  );
}

export function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2.2 2 3.4 4.4 3.4 7s-1.2 5-3.4 7c-2.2-2-3.4-4.4-3.4-7S7.8 5 10 3Z" />
    </Icon>
  );
}

export function GaugeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 15a7 7 0 1 1 14 0" />
      <path d="M10 15 13 9" />
      <circle cx="10" cy="15" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SendIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M17 3 9 11" />
      <path d="M17 3 12 17l-3-6-6-3 14-5Z" />
    </Icon>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10 2.5 16 5v5c0 4-2.6 6.7-6 7.5-3.4-.8-6-3.5-6-7.5V5l6-2.5Z" />
    </Icon>
  );
}

export function AlertIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10 3 2 17h16L10 3Z" />
      <path d="M10 8.5v3.2" />
      <circle cx="10" cy="14.2" r="0.75" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="9" cy="9" r="6" />
      <path d="m17 17-4-4" />
    </Icon>
  );
}

export function WifiOffIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 2l16 16" />
      <path d="M5.5 10a9 9 0 0 1 4-2.1M14.5 10a9 9 0 0 0-2-1.6" />
      <path d="M8 13a4.5 4.5 0 0 1 4 0" />
      <circle cx="10" cy="16.3" r="0.9" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function DocumentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6 2.5h6l3 3v12H6z" />
      <path d="M12 2.5v3h3" />
      <path d="M8 10h5M8 13h5" />
    </Icon>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="m7.5 4.5 6 5.5-6 5.5" />
    </Icon>
  );
}

export function PulseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M2 10h3.5l2-5 3 10 2-7 1.5 2H18" />
    </Icon>
  );
}

export function LungsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10 3v6" />
      <path d="M10 9c-1 0-1.8.9-2.4 2.2l-1.3 3C5.7 15.8 5 17 4 17c-1.4 0-2-1.5-2-3.2 0-3 1.8-6.3 3.6-7.3.7-.4 1.6-.3 2.4.3L10 9Z" />
      <path d="M10 9c1 0 1.8.9 2.4 2.2l1.3 3c.6 1.6 1.3 2.8 2.3 2.8 1.4 0 2-1.5 2-3.2 0-3-1.8-6.3-3.6-7.3-.7-.4-1.6-.3-2.4.3L10 9Z" />
    </Icon>
  );
}

export function DropletIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M10 2.5s5 6 5 9.5a5 5 0 0 1-10 0c0-3.5 5-9.5 5-9.5Z" />
    </Icon>
  );
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8 12a3 3 0 0 0 4.2 0l2.3-2.3a3 3 0 0 0-4.2-4.2l-1 1" />
      <path d="M12 8a3 3 0 0 0-4.2 0L5.5 10.3a3 3 0 0 0 4.2 4.2l1-1" />
    </Icon>
  );
}

export function AccessibilityIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="10" cy="4" r="1.6" fill="currentColor" stroke="none" />
      <path d="M3.5 7c2-.8 4.3-1.2 6.5-1.2S14.5 6.2 16.5 7" />
      <path d="M10 6v5" />
      <path d="M10 11l-2.5 6" />
      <path d="M10 11l2.5 6" />
      <path d="M6 9.5l-1.5 3M14 9.5l1.5 3" />
    </Icon>
  );
}

export function CloseIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M5 5l10 10M15 5 5 15" />
    </Icon>
  );
}

export function MenuIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M3 5.5h14M3 10h14M3 14.5h14" />
    </Icon>
  );
}
