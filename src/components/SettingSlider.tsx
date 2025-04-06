"use client";

import React from "react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";

interface SidebarSliderProps<T extends number | null | undefined = number> {
  label: string;
  value: [T, React.Dispatch<React.SetStateAction<T>>, number];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function SidebarSlider<T extends number | null | undefined = number>({
  label,
  value: stateWithDefault,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}: SidebarSliderProps<T>) {
  const [value, setValue, initialValue] = stateWithDefault;
  const displayValue = value ?? initialValue;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-row justify-between items-center">
        <Label className="text-xs">
          {label}
        </Label>
        <span className="text-xs">{unit ? `${displayValue} ${unit}` : displayValue}</span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[displayValue]}
        onValueChange={([v]) => setValue(((v ?? undefined ? v : initialValue) as unknown) as T)}
        onDoubleClick={() => {
          setValue(initialValue as T);
        }}
        className="w-full max-w-full"
      />
    </div>
  );
}