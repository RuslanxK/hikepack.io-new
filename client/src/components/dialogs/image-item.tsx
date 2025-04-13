import React, { useState, useEffect, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsSharedView } from "@/lib/isSharedView";


interface ImageItemProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  loading: boolean;
  initialImage: string;
  onSave: (image: File | null) => void; 
}

const ImageItem: React.FC<ImageItemProps> = ({
  isOpen,
  onClose,
  title,
  description,
  initialImage,
  loading,
  onSave,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(initialImage);
  const isSharedView = useIsSharedView();
  

  useEffect(() => {
    if (isOpen) {
      setImage(null); // Reset file input on open
      setPreview(initialImage); // Reset preview to initial image
    }
  }, [isOpen, initialImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreview(fileURL);
    } else {
      setPreview(initialImage);
    }
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    onSave(image); // Pass the uploaded image file
    
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <div className="mb-4">
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="mb-4 rounded border"
                style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
              />
            )}

            {!isSharedView &&
            <Input
              type="file"
              accept="image/*"
              disabled={isSharedView}
              onChange={handleFileChange}
              required
            /> }

          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {!isSharedView ?
            <Button type="submit" className="text-white" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
            </Button> : null }
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImageItem;
