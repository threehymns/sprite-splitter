"use client";

import React from "react";
import { motion, AnimatePresence, delay } from "framer-motion";
import { ScrollArea } from "./ui/scroll-area";
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
      <Card className="flex flex-col">
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
        <ScrollArea className="h-[calc(100vh-12.5em)] overflow-y-auto">
          <CardContent className="flex-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                <AnimatePresence mode="popLayout">
                  {slices.map((src, idx) => (
                    <motion.a
                      key={src}
                      href={src}
                      download={`slice_${idx + 1}.png`}
                      whileHover={{ scale: 1.1, rotate: Math.random() * 8 - 4 }} //random rotate value between -2 and 2 deg
                      whileTap={{ scale: 0.95 }}
                      className="block border border-border border-dashed bg-muted rounded-md overflow-hidden shadow-xs hover:shadow-2xl transition-shadow"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.90 }}
                      transition={{ duration: 0.02, default: { ease: "easeInOut", delay: 0.05 } }}
                    >
                      <motion.img src={src} alt={`Slice ${idx}`} 
                        whileHover={{ scale: 0.90, filter: "brightness(1.5)"}}
                        whileTap={{ scale: 1.05 }}
                        initial={{ scale: 0.75 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.5 }}
                        transition={{ duration: 0.01, default: { ease: "easeInOut" } }}
                        className="w-full h-auto rounded-md"
                      />
                    </motion.a>
                  ))}
                </AnimatePresence>
              </div>
          </CardContent>
        </ScrollArea>
      </Card>
    </motion.div>
  );
};

export default SlicesGallery;