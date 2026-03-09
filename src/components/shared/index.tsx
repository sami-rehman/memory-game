// ============================================================
// Shared UI Components (Tailwind)
// ============================================================

import React, { useState, useEffect, useRef } from "react";
import type { GameItem } from "../../types";

// ── Color Palette (for charts, dynamic styles, Recharts) ──
export const P = {
  purple: "#7C3AED", purpleL: "#EDE9FE",
  blue: "#2563EB", blueL: "#DBEAFE",
  green: "#059669", greenL: "#D1FAE5",
  red: "#DC2626", redL: "#FEE2E2",
  orange: "#EA580C", orangeL: "#FFEDD5",
  yellow: "#D97706", yellowL: "#FEF3C7",
  pink: "#DB2777", pinkL: "#FCE7F3",
  slate: "#334155", slateL: "#94A3B8",
  w: "#FFF",
};

export const CHART_COLORS = { A: "#6366F1", B: "#EC4899" };

// Background colors for emoji fallback
const bgColors = ["#DBEAFE", "#D1FAE5", "#FEE2E2", "#FFEDD5", "#EDE9FE", "#FCE7F3", "#FEF3C7", "#E0E7FF"];

// ── Image Card ──
interface ImgProps {
  item: GameItem;
  size?: number;
  label?: boolean;
  style?: React.CSSProperties;
  className?: string;
  objectFit?: "cover" | "contain";
  /** When true, width is 100% with maxWidth: size for responsive layouts */
  fluid?: boolean;
}

export function Img({ item, size = 100, label = true, style = {}, className = "", objectFit = "cover", fluid = false }: ImgProps) {
  const [err, setErr] = useState(false);
  const bgColor = bgColors[item.name.charCodeAt(0) % bgColors.length];

  return (
    <div
      className={`rounded-2xl overflow-hidden bg-white shadow-md border-[3px] border-gray-200 text-center ${className}`}
      style={fluid ? { width: "100%", maxWidth: size, minWidth: 0, ...style } : { width: size, ...style }}
    >
      <div
        className="w-full flex items-center justify-center overflow-hidden"
        style={{
          ...(fluid ? { aspectRatio: "1 / 0.8" } : { height: size * 0.8 }),
          background: err ? bgColor : "#F8FAFC",
        }}
      >
        {!err ? (
          <img
            src={item.img}
            alt={item.name}
            onError={() => setErr(true)}
            className={`w-full h-full object-${objectFit}`}
            loading="eager"
            crossOrigin="anonymous"
          />
        ) : (
          <span style={{ fontSize: size * 0.42 }}>{item.emoji}</span>
        )}
      </div>
      {label && (
        <div
          className="px-1 py-1.5 font-bold text-slate font-game"
          style={{ fontSize: Math.max(11, size * 0.12) }}
        >
          {item.name}
        </div>
      )}
    </div>
  );
}

// ── Timer Bar ──
interface TimerProps {
  dur: number;
  onEnd: () => void;
  on: boolean;
  color?: string;
}

export function TimerBar({ dur, onEnd, on, color = P.green }: TimerProps) {
  const [rem, setRem] = useState(dur);
  const sRef = useRef<number | null>(null);
  const rRef = useRef<number | null>(null);

  useEffect(() => {
    setRem(dur);
    sRef.current = null;
    if (rRef.current) cancelAnimationFrame(rRef.current);
    if (!on) return;

    const tick = (ts: number) => {
      if (!sRef.current) sRef.current = ts;
      const r = Math.max(0, dur - (ts - sRef.current) / 1000);
      setRem(r);
      if (r <= 0) { onEnd(); return; }
      rRef.current = requestAnimationFrame(tick);
    };
    rRef.current = requestAnimationFrame(tick);
    return () => { if (rRef.current) cancelAnimationFrame(rRef.current); };
  }, [dur, on]);

  const pct = (rem / dur) * 100;
  const bc = pct < 20 ? P.red : pct < 45 ? P.orange : color;

  return (
    <div className="w-full relative">
      <div className="w-full h-3.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full transition-colors duration-[400ms]"
          style={{ width: `${pct}%`, backgroundColor: bc }}
        />
      </div>
      <div
        className="absolute right-0 -top-6 text-[15px] font-extrabold font-game"
        style={{ color: bc }}
      >
        {pct < 25 ? "⏰ " : ""}{Math.ceil(rem)}s
      </div>
    </div>
  );
}

// ── Button ──
interface BtnProps {
  children: React.ReactNode;
  onClick: () => void;
  c?: string;
  dis?: boolean;
  sm?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function Btn({ children, onClick, c = P.purple, dis = false, sm = false, style = {}, className = "" }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={dis}
      className={`border-none text-white font-extrabold font-game transition-transform duration-150
        ${sm ? "py-2 px-4 rounded-xl text-sm" : "py-3.5 px-8 rounded-[20px] text-lg"}
        ${dis ? "bg-gray-300 cursor-not-allowed shadow-none" : "cursor-pointer"} ${className}`}
      style={{
        background: dis ? undefined : `linear-gradient(135deg,${c},${c}cc)`,
        boxShadow: dis ? undefined : `0 4px 16px ${c}44`,
        ...style,
      }}
      onMouseDown={(e) => !dis && ((e.target as HTMLElement).style.transform = "scale(.96)")}
      onMouseUp={(e) => ((e.target as HTMLElement).style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

// ── No-op: keyframes live in Tailwind config ──
export function GlobalStyles() {
  return null;
}
