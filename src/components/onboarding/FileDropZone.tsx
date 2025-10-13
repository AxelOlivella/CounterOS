import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Upload, AlertCircle } from "lucide-react";
import { validateFile } from "@/lib/schemas/fileUploadSchema";

interface FileDropZoneProps {
  accept: string;
  multiple?: boolean;
  maxSize: number;
  fileType: 'xml' | 'csv';
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export function FileDropZone({
  accept,
  multiple = false,
  maxSize,
  fileType,
  onFilesSelected,
  disabled = false,
  className,
  title,
  description,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    const fileArray = Array.from(files);
    
    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file, fileType);
      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-8 transition-all duration-200 cursor-pointer",
          "hover:border-primary hover:bg-muted/50",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          error && "border-destructive bg-destructive/5",
          disabled && "opacity-50 cursor-not-allowed hover:border-border hover:bg-transparent",
          !error && !isDragging && "border-border"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div className="flex flex-col items-center text-center space-y-3">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}
          >
            <Upload className={cn("w-6 h-6", isDragging ? "text-primary" : "text-muted-foreground")} />
          </div>

          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              {title || `Arrastra archivos ${accept} aquí`}
            </p>
            <p className="text-xs text-muted-foreground">
              {description || "o haz click para seleccionar"}
            </p>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Archivos aceptados: {accept}</p>
            <p>Tamaño máximo: {(maxSize / 1_000_000).toFixed(0)}MB por archivo</p>
            {multiple && <p>Puedes subir múltiples archivos</p>}
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
