import { useRef } from "react";
import { Camera, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  currentImage?: string | null;
  onUpload: (file: File) => void;
  uploading?: boolean;
  variant?: "avatar" | "cover" | "logo";
  className?: string;
}

const ImageUpload = ({
  currentImage,
  onUpload,
  uploading = false,
  variant = "avatar",
  className = "",
}: ImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      onUpload(file);
    }
  };

  const sizes = {
    avatar: "h-24 w-24 rounded-full",
    cover: "h-32 w-full rounded-lg",
    logo: "h-20 w-20 rounded-xl",
  };

  const renderPlaceholder = () => {
    if (variant === "avatar") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
      );
    }
    if (variant === "logo") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <Camera className="h-8 w-8 text-muted-foreground" />
        </div>
      );
    }
    // Cover
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
        <Camera className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className={`relative group ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />
      <div className={`overflow-hidden ${sizes[variant]}`}>
        {currentImage ? (
          <img
            src={currentImage}
            alt="Upload preview"
            className="w-full h-full object-cover"
          />
        ) : (
          renderPlaceholder()
        )}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={handleClick}
        disabled={uploading}
        className="absolute bottom-1 right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

export default ImageUpload;
