"use client";

import React from "react";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Link, Unlink } from "lucide-react";
import { Button } from "./ui/button";

interface SidebarSliderProps<T extends number | null | undefined = number> {
  label: string;
  // Single slider mode
  value?: [T, React.Dispatch<React.SetStateAction<T>>, number];
  // Dual slider mode
  dualValues?: [
    [T, React.Dispatch<React.SetStateAction<T>>, number],
    [T, React.Dispatch<React.SetStateAction<T>>, number]
  ];
  linked?: boolean;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function SidebarSlider<T extends number | null | undefined = number>({
  label,
  value: singleValueTuple,
  dualValues,
  linked,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
}: SidebarSliderProps<T>) {
  const isDual = !!dualValues;
  const [isLinked, setIsLinked] = React.useState(linked ?? true);

  let content = null;

  if (!isDual && singleValueTuple) {
    // Single slider mode (default)
    const [value, setValue, initialValue] = singleValueTuple;
    const displayValue = value ?? initialValue;

    content = (
      <>
        <div className="flex flex-row justify-between items-center">
          <Label className="text-xs">{label}</Label>
          <span className="text-xs">{unit ? `${displayValue} ${unit}` : displayValue}</span>
        </div>
        <Slider
          min={min}
          max={max}
          step={step}
          value={[displayValue]}
          onValueChange={([v]) =>
            setValue(((v ?? undefined ? v : initialValue) as unknown) as T)
          }
          onDoubleClick={() => {
            setValue(initialValue as T);
          }}
          className="w-full max-w-full"
        />
      </>
    );
  } else if (isDual && dualValues) {
    const [[v1, setV1, init1], [v2, setV2, init2]] = dualValues;
    const displayV1 = v1 ?? init1;
    const displayV2 = v2 ?? init2;

    const handleChangeLocked = (val: number) => {
      setV1(val as T);
      setV2(val as T);
    };

    const handleDoubleClickLocked = () => {
      setV1(init1 as T);
      setV2(init2 as T);
    };

    content = (
      <div className="relative flex">
        {setIsLinked && (
          <Button
            type="button"
            onClick={() => {
              if (!isLinked) {
                // about to link, sync v2 to v1
                setV2((v1 ?? init1) as T);
              }
              setIsLinked(!isLinked);
            }}
            aria-label="Toggle lock"
            className="rounded-full p-0 m-0 size-6 [&_svg:not([class*='size-'])]:size-3 relative bottom-1"
            variant="ghost"
          >
            {isLinked ? <Link className="h-3 w-3" /> : <Unlink className="h-3 w-3" />}
          </Button>
        )}
        {isLinked ? (
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <Label className="text-xs">{label}</Label>
              <span className="text-xs">{unit ? `${displayV1} ${unit}` : displayV1}</span>
            </div>
            <Slider
              min={min}
              max={max}
              step={step}
              value={[displayV1]}
              onValueChange={([v]) =>
                handleChangeLocked(v ?? init1)
              }
              onDoubleClick={handleDoubleClickLocked}
              className="w-full max-w-full"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-row justify-between items-center">
              <Label className="text-xs">{label} x</Label>
              <span className="text-xs">{unit ? `${displayV1} ${unit}` : displayV1}</span>
            </div>
            <Slider
              min={min}
              max={max}
              step={step}
              value={[displayV1]}
              onValueChange={([v]) =>
                setV1(((v ?? undefined ? v : init1) as unknown) as T)
              }
              onDoubleClick={() => {
                setV1(init1 as T);
              }}
              className="w-full max-w-full"
            />
            <div className="flex flex-row justify-between items-center">
              <Label className="text-xs">{label} y</Label>
              <span className="text-xs">{unit ? `${displayV2} ${unit}` : displayV2}</span>
            </div>
            <Slider
              min={min}
              max={max}
              step={step}
              value={[displayV2]}
              onValueChange={([v]) =>
                setV2(((v ?? undefined ? v : init2) as unknown) as T)
              }
              onDoubleClick={() => {
                setV2(init2 as T);
              }}
              className="w-full max-w-full"
            />
          </div>
        )}
      </div>
    );
  } else {
    content = <div>Invalid SidebarSlider props</div>;
  }

  return <div className="flex flex-col gap-2 w-full">{content}</div>;
}