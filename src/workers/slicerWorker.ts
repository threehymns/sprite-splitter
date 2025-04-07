const ctxMap = new Map<number, OffscreenCanvasRenderingContext2D>();

interface SliceParams {
  imageBitmap: ImageBitmap;
  cellWidth: number;
  cellHeight: number;
  offsetX: number;
  offsetY: number;
  marginX: number;
  marginY: number;
  rows: number;
  columns: number;
  chunkStartRow?: number;
  chunkEndRow?: number;
}

interface SliceMessage {
  type: 'slice';
  params: SliceParams;
  jobId: number;
}

interface TerminateMessage {
  type: 'terminate';
}

type WorkerMessage = SliceMessage | TerminateMessage;

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  if (msg.type === 'terminate') {
    ctxMap.clear();
    return;
  }

  if (msg.type === 'slice') {
    const {
      imageBitmap,
      cellWidth,
      cellHeight,
      offsetX,
      offsetY,
      marginX,
      marginY,
      rows,
      columns,
      chunkStartRow = 0,
      chunkEndRow = rows,
    } = msg.params;

    const canvas = new OffscreenCanvas(cellWidth, cellHeight);
    const ctx = canvas.getContext('2d')!;
    const objectUrls: string[] = [];

    for (let row = chunkStartRow; row < chunkEndRow; row++) {
      for (let col = 0; col < columns; col++) {
        const x = marginX + offsetX + col * cellWidth;
        const y = marginY + offsetY + row * cellHeight;

        ctx.clearRect(0, 0, cellWidth, cellHeight);
        ctx.drawImage(
          imageBitmap,
          x,
          y,
          cellWidth,
          cellHeight,
          0,
          0,
          cellWidth,
          cellHeight
        );

        const blob = await canvas.convertToBlob();
        const url = URL.createObjectURL(blob);
        objectUrls.push(url);

        self.postMessage({
          type: 'sliceReady',
          url,
          index: row * columns + col,
          jobId: msg.jobId,
        });
      }
    }

    self.postMessage({
      type: 'done',
      urls: objectUrls,
      jobId: msg.jobId,
    });
  }
};