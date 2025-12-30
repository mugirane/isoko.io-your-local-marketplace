import { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
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

  const placeholders = {
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200",
    cover: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800",
    logo: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200",
  };

  const sizes = {
    avatar: "h-24 w-24 rounded-full",
    cover: "h-32 w-full rounded-lg",
    logo: "h-20 w-20 rounded-xl",
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
        <img
          src={currentImage || placeholders[variant]}
          alt="Upload preview"
          className="w-full h-full object-cover"
        />
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
