"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

interface SlicesGalleryProps {
  slices: string[];
  onDownloadAll: () => void;
}

const SlicesGallery: React.FC<SlicesGalleryProps> = ({ slices, onDownloadAll }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="flex-1 min-w-0"
    >
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Slices</CardTitle>
          <Button
            size="sm"
            variant="secondary"
            onClick={onDownloadAll}
            className="flex items-center gap-2"
          >
            <Download size={16} />
            Download All
          </Button>
        </CardHeader>
        <CardContent className="flex-1">
          {slices.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
              <AnimatePresence mode="popLayout">
                {slices.map((src, idx) => (
                  <motion.a
                    key={idx}
                    href={src}
                    download={`slice_${idx + 1}.png`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="block border rounded overflow-hidden"
                    initial={{ opacity: 0, scale: 0.75 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img src={src} alt={`Slice ${idx}`} className="w-full h-auto" />
                  </motion.a>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex justify-center items-center min-h-[100px] text-muted-foreground">
              No slices yet
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SlicesGallery;