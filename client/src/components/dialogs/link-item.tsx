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

interface LinkItemProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  initialLink: string;
  loading: boolean;
  onSave: (link: string) => void;
}

const LinkItem: React.FC<LinkItemProps> = ({
  isOpen,
  onClose,
  title,
  description,
  initialLink,
  loading,
  onSave,
}) => {
  const [link, setLink] = useState(initialLink);
  const isSharedView = useIsSharedView();

  useEffect(() => {
    if (isOpen) {
      setLink(initialLink); // Reset link when dialog opens
    }
  }, [isOpen, initialLink]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (link.trim()) {
      onSave(link); // Trigger save handler
    }
  };

  if (!isOpen) return null; // Avoid rendering when dialog is closed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <Input
            type="url"
            placeholder="https://example.com"
            name="link"
            value={link}
            readOnly={isSharedView}
            required
            onChange={(e) => {
              if (!isSharedView) setLink(e.target.value);
            }}
            className="mb-4"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {!isSharedView && (
              <Button type="submit" className="text-white" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LinkItem;
