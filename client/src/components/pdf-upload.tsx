import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PDFUploadProps {
  onFilesChange: (files: File[]) => void;
}

export default function PDFUpload({ onFilesChange }: PDFUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    
    Array.from(files).forEach((file) => {
      if (file.type === 'application/pdf' && file.size <= 50 * 1024 * 1024) {
        validFiles.push(file);
      } else {
        toast({
          variant: "destructive",
          title: "Archivo no válido",
          description: `${file.name}: Solo se permiten archivos PDF de máximo 50MB`,
        });
      }
    });

    if (validFiles.length > 0) {
      const newFiles = [...uploadedFiles, ...validFiles];
      setUploadedFiles(newFiles);
      onFilesChange(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFilesChange(newFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center mb-4">
        <i className="fas fa-file-pdf text-primary mr-3 text-xl"></i>
        <h2 className="text-xl font-semibold">Referencias PDF (Opcional)</h2>
      </div>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
          isDragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        data-testid="dropzone-pdf"
      >
        <i className="fas fa-cloud-upload-alt text-4xl text-muted-foreground mb-4"></i>
        <p className="text-muted-foreground mb-4">
          Arrastra y suelta archivos PDF aquí, o haz clic para seleccionar
        </p>
        <Button type="button" data-testid="button-select-pdfs">
          Seleccionar PDFs
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Máximo 50MB por archivo • Formatos: PDF
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
        data-testid="input-file-pdf"
      />

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2" data-testid="file-list">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="file-item">
              <div className="flex items-center space-x-3">
                <i className="fas fa-file-pdf text-red-500"></i>
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeFile(index)}
                className="text-destructive hover:text-destructive/80"
                data-testid={`button-remove-file-${index}`}
              >
                <i className="fas fa-trash"></i>
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
