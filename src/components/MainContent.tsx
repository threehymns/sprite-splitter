"use client";

import React, { type RefObject } from "react";
import { motion } from "framer-motion";
import UploadPanel from "./UploadPanel";
import SlicesGallery from "./SlicesGallery";


interface MainContentProps {
  imageUrl: string | null;
  setImageUrl: (url: string | null) => void;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  bgContainerRef: RefObject<HTMLDivElement | null>;
  slices: string[];
  handleDownloadZip: () => void;
  imageRef?: React.RefObject<HTMLImageElement | null>;
  rows?: number | null;
  columns?: number | null;
  cellWidth?: number;
  cellHeight?: number;
  offsetX?: number;
  offsetY?: number;
  marginX?: number;
  marginY?: number;
}

const MainContent: React.FC<MainContentProps> = ({
  imageUrl,
  setImageUrl,
  canvasRef,
  bgContainerRef,
  slices,
  handleDownloadZip,
  imageRef,
  rows,
  columns,
  cellWidth,
  cellHeight,
  offsetX,
  offsetY,
  marginX,
  marginY,
}) => {
  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full p-6">
      {/* Upload + Preview Combined */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-1 min-w-0"
      >
        <UploadPanel
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          canvasRef={canvasRef}
          bgContainerRef={bgContainerRef}
          imageRef={imageRef}
          rows={rows}
          columns={columns}
          cellWidth={cellWidth}
          cellHeight={cellHeight}
          offsetX={offsetX}
          offsetY={offsetY}
          marginX={marginX}
          marginY={marginY}
        />
      </motion.div>

      {/* Slices */}
      <SlicesGallery slices={slices} onDownloadAll={handleDownloadZip} />
    </div>
  );
};

export default MainContent;