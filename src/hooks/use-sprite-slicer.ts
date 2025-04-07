import { useState, useEffect, useRef } from "react";

interface UseSpriteSlicerProps {
  imageRef: React.RefObject<HTMLImageElement | null>;
  imageUrl: string | null;
  isImageLoaded: boolean;
}

interface WorkerSliceReady {
  jobId: number;
  type: "sliceReady";
  url: string;
  index: number;
}

interface WorkerDone {
  jobId: number;
  type: "done";
  urls: string[];
}

type WorkerResponse = WorkerSliceReady | WorkerDone;

const MIN_DEBOUNCE = 50;
const MAX_DEBOUNCE = 300;
const IDLE_THRESHOLD = 200; // ms

export function useSpriteSlicer({ imageRef, imageUrl, isImageLoaded }: UseSpriteSlicerProps) {
  const [cellWidth, setCellWidth] = useState(32);
  const [cellHeight, setCellHeight] = useState(32);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [marginX, setMarginX] = useState(0);
  const [marginY, setMarginY] = useState(0);
  const [rows, setRows] = useState<number | null>(4);
  const [columns, setColumns] = useState<number | null>(4);
  const [slices, setSlices] = useState<string[]>([]);
  const [sliceBlobs, setSliceBlobs] = useState<Blob[]>([]);

  const workerRef = useRef<Worker | null>(null);
  const lastChangeTimeRef = useRef<number>(0);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevObjectUrlsRef = useRef<string[]>([]);
  const pendingSlicesRef = useRef<Map<number, string>>(new Map());
  const rafPendingRef = useRef(false);
const jobIdRef = useRef(0);

  function cleanupUrls() {
    prevObjectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    prevObjectUrlsRef.current = [];
  }

  function startWorker(imageBitmap: ImageBitmap) {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
    const worker = new Worker(new URL("../workers/slicerWorker.ts", import.meta.url), { type: "module" });
    workerRef.current = worker;

    // Increment job id for new slicing job
    jobIdRef.current++;
    const currentJobId = jobIdRef.current;

    const params = {
      imageBitmap,
      cellWidth,
      cellHeight,
      offsetX,
      offsetY,
      marginX,
      marginY,
      rows: rows ?? 1,
      columns: columns ?? 1,
    };

    cleanupUrls();
    setSlices([]);
    pendingSlicesRef.current.clear();

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data;
      if (data.jobId !== jobIdRef.current) {
        // Outdated message, ignore
        return;
      }
      if (data.type === "sliceReady") {
        pendingSlicesRef.current.set(data.index, data.url);
        if (!rafPendingRef.current) {
          rafPendingRef.current = true;
          requestAnimationFrame(() => {
            const newSlices: string[] = [];
            const maxIndex = Math.max(...pendingSlicesRef.current.keys());
            for (let i = 0; i <= maxIndex; i++) {
              newSlices[i] = pendingSlicesRef.current.get(i) ?? "";
            }
            setSlices(newSlices);
            rafPendingRef.current = false;
          });
        }
      } else if (data.type === "done") {
        prevObjectUrlsRef.current = data.urls;
      }
    };

    worker.postMessage({ type: "slice", params, jobId: currentJobId }, [imageBitmap]);
  }

  function triggerSlicing() {
    if (!isImageLoaded || !imageRef.current || !(imageRef.current instanceof HTMLImageElement) || !rows || !columns) {
      setSlices([]);
      return;
    }

    createImageBitmap(imageRef.current)
      .then((bitmap) => {
        startWorker(bitmap);
      })
      .catch(() => {
        setSlices([]);
      });
  }
function scheduleDebouncedSlicing() {
  const now = Date.now();
  const elapsed = now - lastChangeTimeRef.current;
  lastChangeTimeRef.current = now;

  const delay = elapsed < IDLE_THRESHOLD ? MIN_DEBOUNCE : MAX_DEBOUNCE;

  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }

  debounceTimeoutRef.current = setTimeout(() => {
    triggerSlicing();
  }, delay);
}

function cancelCurrentJob() {
  if (workerRef.current) {
    workerRef.current.terminate();
    workerRef.current = null;
    pendingSlicesRef.current.clear();
  }
  jobIdRef.current++;
}

  // Watch parameters
  useEffect(() => {
    cancelCurrentJob();
    scheduleDebouncedSlicing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellWidth, cellHeight, offsetX, offsetY, marginX, marginY, rows, columns, isImageLoaded, imageUrl]);

  // Calculate cell size when image loads or params change
  useEffect(() => {
    if (imageRef.current && rows && columns && imageRef.current instanceof HTMLImageElement) {
      const img = imageRef.current;
      const effectiveWidth = img.width - 2 * marginX;
      const effectiveHeight = img.height - 2 * marginY;
      const w = Math.floor(effectiveWidth / columns);
      const h = Math.floor(effectiveHeight / rows);
      if (cellWidth !== w) setCellWidth(w);
      if (cellHeight !== h) setCellHeight(h);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marginX, marginY, rows, columns, isImageLoaded, imageUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupUrls();
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  async function handleDownloadZip() {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    const base64Promises = sliceBlobs.map(
      (blob) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1] ?? "";
            resolve(base64);
          };
          reader.readAsDataURL(blob);
        })
    );

    const base64Strings = await Promise.all(base64Promises);

    base64Strings.forEach((base64, idx) => {
      zip.file(`slice_${idx + 1}.png`, base64, { base64: true });
    });

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sprites.zip";
    a.click();
    URL.revokeObjectURL(url);
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
    setRows: (value: React.SetStateAction<number>) => {
      if (typeof value === "function") {
        setRows((prev) => {
          const safePrev = prev ?? 0;
          return (value as (prevState: number) => number)(safePrev);
        });
      } else {
        setRows(value);
      }
    },
    setColumns: (value: React.SetStateAction<number>) => {
      if (typeof value === "function") {
        setColumns((prev) => {
          const safePrev = prev ?? 0;
          return (value as (prevState: number) => number)(safePrev);
        });
      } else {
        setColumns(value);
      }
    },
    handleDownloadZip,
  };
}