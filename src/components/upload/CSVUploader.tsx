
import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProductReview, processCSV } from "../data/SentimentAPI";
import { Upload } from "lucide-react";

interface CSVUploaderProps {
  onDataProcessed: (data: ProductReview[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CSVUploader = ({ onDataProcessed, isLoading, setIsLoading }: CSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): ProductReview[] => {
    const lines = text.split("\n");
    const headers = lines[0].split(",");
    
    // Verificamos que el CSV tenga las columnas necesarias
    const productIndex = headers.findIndex(h => h.toLowerCase().includes("product"));
    const reviewIndex = headers.findIndex(h => h.toLowerCase().includes("review"));
    
    if (productIndex === -1 || reviewIndex === -1) {
      throw new Error("El CSV debe contener columnas de 'product' y 'review'");
    }
    
    return lines
      .slice(1) // Omitimos las cabeceras
      .filter(line => line.trim() !== "")
      .map((line, index) => {
        const values = line.split(",");
        return {
          id: `review-${index}`,
          product: values[productIndex].trim(),
          review: values[reviewIndex].trim()
        };
      });
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setIsLoading(true);
    
    try {
      const text = await file.text();
      const reviews = parseCSV(text);
      
      if (reviews.length === 0) {
        toast.error("No se encontraron reseñas válidas en el archivo");
        setIsLoading(false);
        return;
      }
      
      toast.info(`Procesando ${reviews.length} reseñas...`);
      
      // Procesamos las reseñas con la API
      const processedReviews = await processCSV(reviews);
      onDataProcessed(processedReviews);
      
      toast.success(`¡${processedReviews.length} reseñas analizadas correctamente!`);
    } catch (error) {
      console.error("Error al procesar el archivo:", error);
      toast.error(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fade-in">
      <h2 className="text-xl font-semibold mb-4">Cargar archivo CSV</h2>
      <p className="text-gray-600 mb-4">
        Sube un archivo CSV con reseñas de productos. El archivo debe contener al menos
        las columnas "product" y "review".
      </p>
      
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
            disabled={!file || isLoading}
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
    </div>
  );
};

export default CSVUploader;
