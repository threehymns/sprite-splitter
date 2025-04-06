import { useState } from "react";
import { useDebounce } from "react-use";
import JSZip from "jszip";
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
  columns: number
): string[] {
  const slices: string[] = [];
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = marginX + offsetX + col * cellWidth;
      const y = marginY + offsetY + row * cellHeight;

      canvas.width = cellWidth;
      canvas.height = cellHeight;

      ctx.clearRect(0, 0, cellWidth, cellHeight);
      ctx.drawImage(
        img,
        x,
        y,
        cellWidth,
        cellHeight,
        0,
        0,
        cellWidth,
        cellHeight
      );

      slices.push(canvas.toDataURL());
    }
  }

  return slices;
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
}

export function useSpriteSlicer({ imageRef, imageUrl }: UseSpriteSlicerProps) {
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

  useDebounce(
    () => {
      if (!imageRef.current || !rows || !columns) return;
      if (!(imageRef.current instanceof HTMLImageElement)) return;

      const img = imageRef.current;
      const { cellWidth: w, cellHeight: h } = calculateCellSize(
        img.width,
        img.height,
        marginX,
        marginY,
        columns,
        rows
      );
      setCellWidth(w);
      setCellHeight(h);
    },
    100,
    [imageUrl, rows, columns, marginX, marginY]
  );

  useDebounce(
    () => {
      if (!imageRef.current || !rows || !columns) {
        setSlices([]);
        return;
      }
      if (!(imageRef.current instanceof HTMLImageElement)) {
        setSlices([]);
        return;
      }

      const img = imageRef.current;
      const newSlices = sliceImage(
        img,
        cellWidth,
        cellHeight,
        offsetX,
        offsetY,
        marginX,
        marginY,
        rows,
        columns
      );
      setSlices(newSlices);
    },
    100,
    [imageUrl, cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, rows, columns]
  );

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