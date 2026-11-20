"use client";

// A stage's colour: the palette, or any colour from the wheel (hue round the
// wheel, saturation from the centre, brightness on the slider), or a hex.

import { useEffect, useRef, useState } from "react";
import { Popover, Tooltip } from "@mui/material";
import { Check } from "lucide-react";
import { AppInput } from "@/components/ui/app-input";
import { cn } from "@/lib/utils";
import { STAGE_PALETTE, normalizeHex } from "./stageRules";
import { hexToHsv, hsToWheelPoint, hsvToHex, wheelPointToHs, type Hsv } from "./colorMath";

interface StageColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  /** The stage's name, for the button's label. */
  stageName: string;
  disabled?: boolean;
}

const WHEEL = 168;
const RADIUS = WHEEL / 2;

function ColorWheel({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const [hsv, setHsv] = useState<Hsv>(() => hexToHsv(value));
  const wheelRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // A colour picked elsewhere (palette, hex field) moves the marker; the
  // wheel's own changes keep their hue even at zero saturation.
  useEffect(() => {
    if (hsvToHex(hsv) !== value.toUpperCase()) setHsv(hexToHsv(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const apply = (next: Hsv) => {
    setHsv(next);
    onChange(hsvToHex(next));
  };

  const pickAt = (clientX: number, clientY: number) => {
    const box = wheelRef.current?.getBoundingClientRect();
    if (!box) return;
    const { h, s } = wheelPointToHs(clientX - box.left - RADIUS, clientY - box.top - RADIUS, RADIUS);
    apply({ ...hsv, h, s, v: hsv.v || 1 });
  };

  const marker = hsToWheelPoint(hsv.h, hsv.s, RADIUS);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={wheelRef}
        role="slider"
        aria-label="Colour wheel"
        aria-valuenow={Math.round(hsv.h)}
        aria-valuemin={0}
        aria-valuemax={359}
        aria-valuetext={hsvToHex(hsv)}
        tabIndex={0}
        className="relative cursor-crosshair touch-none rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
        style={{ width: WHEEL, height: WHEEL, background: "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)" }}
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          pickAt(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => dragging.current && pickAt(event.clientX, event.clientY)}
        onPointerUp={() => (dragging.current = false)}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 15 : 5;
          if (event.key === "ArrowRight") apply({ ...hsv, h: (hsv.h + step) % 360 });
          else if (event.key === "ArrowLeft") apply({ ...hsv, h: (hsv.h - step + 360) % 360 });
          else if (event.key === "ArrowUp") apply({ ...hsv, s: Math.min(1, hsv.s + 0.05) });
          else if (event.key === "ArrowDown") apply({ ...hsv, s: Math.max(0, hsv.s - 0.05) });
          else return;
          event.preventDefault();
        }}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, white, transparent 70%)" }} />
        <div className="absolute inset-0 rounded-full bg-black" style={{ opacity: 1 - hsv.v }} />
        <span
          className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/30"
          style={{ left: RADIUS + marker.x, top: RADIUS + marker.y, backgroundColor: hsvToHex(hsv) }}
        />
      </div>
      <label className="flex w-full flex-col gap-1 text-xs font-medium text-gray-600">
        Brightness
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(hsv.v * 100)}
          onChange={(event) => apply({ ...hsv, v: Number(event.target.value) / 100 })}
          className="h-2 w-full cursor-pointer appearance-none rounded-full"
          style={{ background: `linear-gradient(to right, #000, ${hsvToHex({ ...hsv, v: 1 })})` }}
        />
      </label>
    </div>
  );
}

export default function StageColorPicker({ value, onChange, stageName, disabled }: StageColorPickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [tab, setTab] = useState<"palette" | "wheel">("palette");
  const [hex, setHex] = useState(value);
  const typed = normalizeHex(hex);

  useEffect(() => {
    setHex(value);
  }, [value]);

  const pick = (color: string) => onChange(color);

  return (
    <>
      <Tooltip title="Change colour">
        <span>
          <button
            type="button"
            disabled={disabled}
            aria-label={`Colour of ${stageName || "this stage"}`}
            aria-haspopup="dialog"
            onClick={(event) => setAnchorEl(event.currentTarget)}
            className="h-7 w-7 shrink-0 cursor-pointer rounded-full border-2 border-white shadow ring-1 ring-gray-300 transition hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            style={{ backgroundColor: value }}
          />
        </span>
      </Tooltip>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { borderRadius: 3, p: 2, width: 240 } } }}
      >
        <div role="tablist" aria-label="Colour picker" className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-gray-100 p-1">
          {(["palette", "wheel"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "cursor-pointer rounded-md py-1.5 text-xs font-semibold transition",
                tab === key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800",
              )}
            >
              {key === "palette" ? "Palette" : "Wheel"}
            </button>
          ))}
        </div>

        {tab === "palette" ? (
          <div role="radiogroup" aria-label="Stage colours" className="grid grid-cols-5 gap-2">
            {STAGE_PALETTE.map((color) => {
              const selected = color === value.toUpperCase();
              return (
                <button
                  key={color}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color}
                  onClick={() => pick(color)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  style={{ backgroundColor: color }}
                >
                  {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        ) : (
          <ColorWheel value={value} onChange={pick} />
        )}

        {/* The label sits above both, so the swatch and the field share one
            row and one height. */}
        <label htmlFor="stage-hex-colour" className="mb-1 mt-3 block text-sm font-medium text-gray-700">
          Hex
        </label>
        <div className="flex items-start gap-2">
          <span className="h-[38px] w-[38px] shrink-0 rounded-lg ring-1 ring-gray-200" style={{ backgroundColor: value }} aria-hidden />
          <div className="min-w-0 flex-1">
            <AppInput
              id="stage-hex-colour"
              value={hex}
              onChange={(event) => {
                setHex(event.target.value);
                const valid = normalizeHex(event.target.value);
                if (valid) pick(valid);
              }}
              height="38px"
              error={!typed}
              helperText={typed ? undefined : "Use a colour like #26C6F9"}
              inputProps={{ maxLength: 7, "aria-label": "Hex colour" }}
            />
          </div>
        </div>
      </Popover>
    </>
  );
}
