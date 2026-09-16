"use client";

import type { SVGProps } from "react";

const INK = "#1c1917";
const EDGE = "#44403c";
const MUTED = "#a8a29e";
const GOLD = "#a16207";
const BONE = "#f7f6f4";
const LINEN = "#e7e5e4";
const LINE = "#d6d3d1";

export type ProductViewId = "front" | "back" | "side" | "top" | "camera";

export const PRODUCT_VIEWS: { id: ProductViewId; label: string }[] = [
  { id: "front", label: "Front" },
  { id: "back", label: "Back" },
  { id: "side", label: "Side" },
  { id: "top", label: "Top" },
  { id: "camera", label: "Camera" },
];

const base = {
  viewBox: "0 0 400 460",
  fill: "none",
  "aria-hidden": true as const,
};

function FloorShadow() {
  return <ellipse cx="200" cy="404" rx="120" ry="11" fill="#0c0a09" opacity="0.07" />;
}

function FrontView(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <FloorShadow />
      {/* clear case frame */}
      <rect x="84" y="48" width="232" height="344" rx="56" fill="#ffffff" stroke={LINE} strokeWidth="2.5" />
      {/* phone body / screen */}
      <rect x="94" y="58" width="212" height="324" rx="46" fill={INK} />
      {/* screen sheen */}
      <rect x="94" y="58" width="212" height="324" rx="46" fill="#ffffff" opacity="0.04" />
      {/* punch-hole camera */}
      <circle cx="200" cy="92" r="7" fill="#0a0a0a" stroke="#2a2622" strokeWidth="2" />
      {/* raised case edge on the left */}
      <rect x="89" y="66" width="4" height="308" rx="2" fill={EDGE} opacity="0.4" />
      {/* gold seam inside the clear case */}
      <rect x="91" y="72" width="2" height="296" rx="1" fill={GOLD} opacity="0.45" />
      {/* side buttons */}
      <rect x="79" y="150" width="6" height="28" rx="3" fill={MUTED} />
      <rect x="79" y="184" width="6" height="28" rx="3" fill={MUTED} />
      <rect x="79" y="218" width="6" height="20" rx="3" fill={MUTED} />
      <rect x="315" y="170" width="6" height="26" rx="3" fill={MUTED} />
    </svg>
  );
}

function BackView(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <FloorShadow />
      {/* case backplate */}
      <rect x="88" y="52" width="224" height="336" rx="52" fill={BONE} stroke={LINE} strokeWidth="2.5" />
      {/* subtle inner bevel */}
      <rect x="96" y="60" width="208" height="320" rx="46" fill="#ffffff" opacity="0.45" />
      {/* camera island */}
      <rect x="118" y="86" width="112" height="88" rx="24" fill={LINEN} stroke={LINE} strokeWidth="2" />
      <circle cx="151" cy="112" r="21" fill={INK} stroke="#000000" strokeWidth="2" />
      <circle cx="151" cy="112" r="14" fill="#0c0a09" stroke={GOLD} strokeWidth="2" opacity="0.85" />
      <circle cx="151" cy="112" r="6" fill="#000000" />
      <circle cx="151" cy="142" r="17" fill={INK} stroke="#000000" strokeWidth="2" />
      <circle cx="151" cy="142" r="11" fill="#0c0a09" stroke={GOLD} strokeWidth="2" opacity="0.85" />
      <circle cx="151" cy="142" r="5" fill="#000000" />
      <circle cx="202" cy="98" r="7" fill={MUTED} stroke="#d6d3d1" strokeWidth="1.5" />
      {/* embossed wordmark */}
      <text
        x="200"
        y="300"
        textAnchor="middle"
        fontSize="11"
        letterSpacing="3.5"
        fill={GOLD}
        opacity="0.9"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        MOBILE CASES
      </text>
      {/* gold corner detail */}
      <path d="M106 366 Q102 352 112 344" stroke={GOLD} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function SideView(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <FloorShadow />
      {/* raised case lips */}
      <rect x="50" y="146" width="300" height="22" rx="11" fill={LINEN} stroke={LINE} strokeWidth="2" />
      <rect x="50" y="292" width="300" height="22" rx="11" fill={LINEN} stroke={LINE} strokeWidth="2" />
      {/* device slab */}
      <rect x="56" y="164" width="288" height="132" rx="20" fill={INK} />
      {/* screen edge sheen */}
      <rect x="56" y="164" width="288" height="132" rx="20" fill="#ffffff" opacity="0.05" />
      {/* gold seam along the lip */}
      <line x1="64" y1="168" x2="336" y2="168" stroke={GOLD} strokeWidth="2" opacity="0.6" />
      {/* protruding buttons */}
      <rect x="42" y="178" width="10" height="30" rx="3" fill={MUTED} />
      <rect x="42" y="216" width="10" height="22" rx="3" fill={MUTED} />
      <rect x="42" y="246" width="10" height="24" rx="3" fill={MUTED} />
      <rect x="348" y="198" width="10" height="26" rx="3" fill={MUTED} />
    </svg>
  );
}

function TopView(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <FloorShadow />
      {/* slab seen from above */}
      <rect x="60" y="188" width="280" height="84" rx="22" fill={BONE} stroke={LINE} strokeWidth="2.5" />
      {/* inner screen-edge panel */}
      <rect x="68" y="196" width="264" height="68" rx="16" fill={INK} opacity="0.92" />
      {/* punch-hole */}
      <circle cx="168" cy="230" r="6" fill="#0c0a09" stroke="#2a2622" strokeWidth="1.5" />
      {/* camera island to the right */}
      <rect x="228" y="204" width="88" height="52" rx="16" fill={LINEN} stroke="#d6d3d1" strokeWidth="2" />
      <circle cx="248" cy="230" r="13" fill={INK} />
      <circle cx="248" cy="230" r="8" fill="#0c0a09" stroke={GOLD} strokeWidth="2" opacity="0.85" />
      <circle cx="286" cy="230" r="13" fill={INK} />
      <circle cx="286" cy="230" r="8" fill="#0c0a09" stroke={GOLD} strokeWidth="2" opacity="0.85" />
      {/* antenna seams */}
      <line x1="84" y1="204" x2="84" y2="256" stroke={GOLD} strokeWidth="2" opacity="0.5" />
      <line x1="316" y1="204" x2="316" y2="256" stroke={GOLD} strokeWidth="2" opacity="0.5" />
    </svg>
  );
}

function CameraView(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      {/* backplate hint */}
      <rect x="66" y="96" width="268" height="268" rx="44" fill={BONE} stroke={LINE} strokeWidth="2.5" />
      {/* camera island close-up */}
      <rect x="94" y="124" width="212" height="212" rx="64" fill={LINEN} stroke="#d6d3d1" strokeWidth="2" />
      {/* main lens */}
      <circle cx="188" cy="202" r="64" fill={INK} />
      <circle cx="188" cy="202" r="50" fill="#000000" stroke={GOLD} strokeWidth="3" opacity="0.9" />
      <circle cx="188" cy="202" r="32" fill="#111111" />
      <circle cx="188" cy="202" r="21" fill="#0a0a0a" />
      <circle cx="178" cy="190" r="14" fill="#ffffff" opacity="0.12" />
      {/* secondary lens */}
      <circle cx="188" cy="288" r="42" fill={INK} />
      <circle cx="188" cy="288" r="32" fill="#000000" stroke={GOLD} strokeWidth="2.5" opacity="0.8" />
      <circle cx="188" cy="288" r="20" fill="#111111" />
      <circle cx="183" cy="281" r="9" fill="#ffffff" opacity="0.12" />
      {/* flash */}
      <circle cx="256" cy="150" r="10" fill={MUTED} stroke="#d6d3d1" strokeWidth="1.5" />
      {/* gold seam */}
      <path d="M322 100 Q330 100 330 108" stroke={GOLD} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

const VIEW_COMPONENTS: Record<ProductViewId, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  front: FrontView,
  back: BackView,
  side: SideView,
  top: TopView,
  camera: CameraView,
};

export function ProductView({
  view,
  className,
}: {
  view: ProductViewId;
  className?: string;
}) {
  const Component = VIEW_COMPONENTS[view];
  return <Component className={className} />;
}