import { useEffect, useRef } from "react";

export function useImageLoader(imageUrl: string | null) {
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!imageUrl) {
      imageRef.current = null;
      return;
    }

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      imageRef.current = img;
    };
  }, [imageUrl]);

  return { imageRef };
}