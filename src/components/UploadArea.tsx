import React from "react";
import { Upload } from "lucide-react";
import { Input } from "./ui/input";

interface UploadAreaProps {
  onFileSelected: (file: File) => void;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onFileSelected }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
  };

  return (
    <div
      className="flex-1 border-2 border-dashed rounded-lg p-10 space-y-6 text-center cursor-pointer hover:bg-accent transition min-h-[150px] flex flex-col justify-center items-center"
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <Upload className="w-16 h-16 text-muted-foreground" />
      <p className="mb-2">Drop or paste an image.</p>
      <Input
        id="file-input"
        type="file"
        accept="image/png,image/jpeg,image/gif,image/webp,image/avif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default UploadArea;