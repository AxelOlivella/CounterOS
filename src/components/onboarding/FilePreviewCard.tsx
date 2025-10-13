import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, X, CheckCircle } from "lucide-react";
import { formatFileSize } from "@/lib/schemas/fileUploadSchema";

interface FilePreviewCardProps {
  file: File;
  onRemove: () => void;
  index?: number;
}

export function FilePreviewCard({ file, onRemove, index }: FilePreviewCardProps) {
  return (
    <Card className="p-3 flex items-center gap-3 hover:shadow-md transition-shadow">
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <FileText className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          <p className="text-sm font-medium text-foreground truncate">
            {index !== undefined && `${index + 1}. `}
            {file.name}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(file.size)}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
        title="Eliminar archivo"
      >
        <X className="w-4 h-4" />
      </Button>
    </Card>
  );
}
