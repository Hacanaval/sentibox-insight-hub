
import { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileUploadInterfaceProps {
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  file: File | null;
  isLoading: boolean;
  isAPIConnected: boolean | null;
}

const FileUploadInterface = ({
  handleFileChange,
  handleUpload,
  file,
  isLoading,
  isAPIConnected
}: FileUploadInterfaceProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="flex-1"
        />
        <Button 
          onClick={handleUpload} 
          disabled={!file || isLoading || isAPIConnected === false}
          className="gap-2"
        >
          <Upload size={16} />
          Procesar
        </Button>
      </div>
      
      {file && (
        <p className="text-sm text-gray-500">
          Archivo seleccionado: <span className="font-medium">{file.name}</span>
        </p>
      )}
      
      {isLoading && (
        <div className="text-center text-gray-500 py-2">
          <div className="inline-block h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2 align-middle"></div>
          Procesando reseñas...
        </div>
      )}
    </div>
  );
};

export default FileUploadInterface;
