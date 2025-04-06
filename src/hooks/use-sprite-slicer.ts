import { useState } from "react";
import JSZip from "jszip";

declare global {
  interface Window {
    _sliceImageDebounce?: {
      timeout: ReturnType<typeof setTimeout> | null;
      lastResult: string[];
      lastArgs: {
        img: HTMLImageElement;
        cellWidth: number;
        cellHeight: number;
        offsetX: number;
        offsetY: number;
        marginX: number;
        marginY: number;
        rows: number;
        columns: number;
      } | null;
    };
  }
}
/**
 * Calculate the size of each cell in the sprite sheet.
 */
export function calculateCellSize(
  imgWidth: number,
  imgHeight: number,
  marginX: number,
  marginY: number,
  columns: number,
  rows: number
): { cellWidth: number; cellHeight: number } {
  const effectiveWidth = imgWidth - 2 * marginX;
  const effectiveHeight = imgHeight - 2 * marginY;
  const cellWidth = Math.floor(effectiveWidth / columns);
  const cellHeight = Math.floor(effectiveHeight / rows);
  return { cellWidth, cellHeight };
}

/**
 * Slice the sprite sheet image into individual cell images.
 */
export function sliceImage(
  img: HTMLImageElement,
  cellWidth: number,
  cellHeight: number,
  offsetX: number,
  offsetY: number,
  marginX: number,
  marginY: number,
  rows: number,
  columns: number,
  onSlicesReady: (slices: string[]) => void
): void {
  type SliceArgs = {
    img: HTMLImageElement;
    cellWidth: number;
    cellHeight: number;
    offsetX: number;
    offsetY: number;
    marginX: number;
    marginY: number;
    rows: number;
    columns: number;
    onSlicesReady: (slices: string[]) => void;
  };

  const debounceTime = 100;
  if (!window._sliceImageDebounce) {
    window._sliceImageDebounce = {
      timeout: null,
      lastResult: [],
      lastArgs: null,
    };
  }
  const state = window._sliceImageDebounce as {
    timeout: ReturnType<typeof setTimeout> | null;
    lastResult: string[];
    lastArgs: SliceArgs | null;
  };

  state.lastArgs = {
    img,
    cellWidth,
    cellHeight,
    offsetX,
    offsetY,
    marginX,
    marginY,
    rows,
    columns,
    onSlicesReady,
  };

  if (state.timeout) {
    clearTimeout(state.timeout);
  }

  state.timeout = setTimeout(() => {
    const args = state.lastArgs!;
    const slices: string[] = [];
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    for (let row = 0; row < args.rows; row++) {
      for (let col = 0; col < args.columns; col++) {
        const x = args.marginX + args.offsetX + col * args.cellWidth;
        const y = args.marginY + args.offsetY + row * args.cellHeight;

        canvas.width = args.cellWidth;
        canvas.height = args.cellHeight;

        ctx.clearRect(0, 0, args.cellWidth, args.cellHeight);
        ctx.drawImage(
          args.img,
          x,
          y,
          args.cellWidth,
          args.cellHeight,
          0,
          0,
          args.cellWidth,
          args.cellHeight
        );

        slices.push(canvas.toDataURL());
      }
    }

    state.lastResult = slices;
    args.onSlicesReady(slices);
  }, debounceTime);
}

export async function downloadSlicesAsZip(slices: string[]): Promise<void> {
  const zip = new JSZip()
  slices.forEach((dataUrl, idx) => {
    const base64 = dataUrl.split(",")[1] ?? ""
    zip.file(`slice_${idx + 1}.png`, base64, { base64: true })
  })
  const blob = await zip.generateAsync({ type: "blob" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "sprites.zip"
  a.click()
  URL.revokeObjectURL(url)
}



interface UseSpriteSlicerProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  imageUrl: string | null;
  isImageLoaded: boolean;
}

export function useSpriteSlicer({ imageRef, imageUrl, isImageLoaded }: UseSpriteSlicerProps) {
  const [cellWidth, setCellWidth] = useState<number>(32);
  const [cellHeight, setCellHeight] = useState<number>(32);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [marginX, setMarginX] = useState<number>(0);
  const [marginY, setMarginY] = useState<number>(0);
  const [rows, setRows] = useState<number | null>(4);
  const [columns, setColumns] = useState<number | null>(4);
  const [slices, setSlices] = useState<string[]>([]);

  const handleSetColumns: React.Dispatch<React.SetStateAction<number | null>> = (value) => {
    if (typeof value === "function") {
      setColumns((prev) => {
        const result = value(prev ?? 0);
        return result !== undefined ? result : null;
      });
    } else {
      setColumns(value !== undefined ? value : null);
    }
  };

  const handleSetRows: React.Dispatch<React.SetStateAction<number | null>> = (value) => {
    if (typeof value === "function") {
      setRows((prev) => {
        const result = value(prev ?? 0);
        return result !== undefined ? result : null;
      });
    } else {
      setRows(value !== undefined ? value : null);
    }
  };

  const setColumnsWrapper: React.Dispatch<React.SetStateAction<number>> = (value) => {
    if (typeof value === "function") {
      handleSetColumns((prev) => {
        const safePrev = prev ?? 0;
        const result = (value as (prevState: number) => number)(safePrev);
        return result;
      });
    } else {
      handleSetColumns(value);
    }
  };

  const setRowsWrapper: React.Dispatch<React.SetStateAction<number>> = (value) => {
    if (typeof value === "function") {
      handleSetRows((prev) => {
        const safePrev = prev ?? 0;
        const result = (value as (prevState: number) => number)(safePrev);
        return result;
      });
    } else {
      handleSetRows(value);
    }
  };

  const handleDownloadZip = async () => {
    await downloadSlicesAsZip(slices);
  };

  // Immediate update of cell size without debounce
  if (imageRef.current && rows && columns && imageRef.current instanceof HTMLImageElement) {
    const img = imageRef.current;
    const { cellWidth: w, cellHeight: h } = calculateCellSize(
      img.width,
      img.height,
      marginX,
      marginY,
      columns,
      rows
    );
    if (cellWidth !== w) setCellWidth(w);
    if (cellHeight !== h) setCellHeight(h);
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  if (!isImageLoaded && slices.length !== 0) {
    setSlices([]);
  }
  // dependencies: imageUrl, rows, columns, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, isImageLoaded, imageRef
  // Immediate update of slices without debounce; debounce is inside sliceImage
  if (isImageLoaded) {
    if (!imageRef.current || !rows || !columns) {
      if (slices.length !== 0) setSlices([]);
    } else if (!(imageRef.current instanceof HTMLImageElement)) {
      if (slices.length !== 0) setSlices([]);
    } else {
      const img = imageRef.current;

      sliceImage(
        img,
        cellWidth,
        cellHeight,
        offsetX,
        offsetY,
        marginX,
        marginY,
        rows,
        columns,
        (newSlices) => {
          setSlices(newSlices);
        }
      );
    }
  }

  return {
    cellWidth,
    cellHeight,
    offsetX,
    offsetY,
    marginX,
    marginY,
    rows,
    columns,
    slices,
    setOffsetX,
    setOffsetY,
    setMarginX,
    setMarginY,
    setRows: setRowsWrapper,
    setColumns: setColumnsWrapper,
    handleDownloadZip,
  };
}