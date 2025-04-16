
import { ChangeEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ProductReview, processCSV, checkAPIConnection } from "../data/SentimentAPI";
import { Upload, AlertTriangle } from "lucide-react";

interface CSVUploaderProps {
  onDataProcessed: (data: ProductReview[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Define a temporary type for parsing CSV data before assigning IDs
interface TempReview {
  product: string;
  review: string;
}

const CSVUploader = ({ onDataProcessed, isLoading, setIsLoading }: CSVUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAPIConnected, setIsAPIConnected] = useState<boolean | null>(null);

  // Verificar la conexión a la API al montar el componente
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const connected = await checkAPIConnection();
        setIsAPIConnected(connected);
        if (!connected) {
          toast.error("No se pudo conectar con la API de análisis. Verifica que el servidor Flask esté en ejecución.", {
            duration: 10000,
          });
        }
      } catch (error) {
        console.error("Error al verificar la conexión:", error);
        setIsAPIConnected(false);
      }
    };

    verifyConnection();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (text: string): ProductReview[] => {
    const lines = text.split("\n");
    const headers = lines[0].split(",");
    
    // Verificamos si el archivo contiene columnas específicas de Amazon
    const reviewContentIndex = headers.findIndex(h => h.toLowerCase().includes("review_content"));
    const asinIndex = headers.findIndex(h => h.toLowerCase().includes("asin") || h.toLowerCase().includes("product_id"));
    
    if (reviewContentIndex !== -1 && asinIndex !== -1) {
      // Formato específico de Amazon
      console.log("Detectado formato Amazon:", headers);
      return lines
        .slice(1) // Omitimos las cabeceras
        .filter(line => line.trim() !== "")
        .map((line, index) => {
          const values = line.split(",");
          return {
            id: `review-${index}`,
            product: values[asinIndex].trim(),
            review: values[reviewContentIndex].trim()
          };
        });
    }
    
    // Formato genérico (buscamos product/producto y review/reseña)
    const productIndex = headers.findIndex(h => 
      h.toLowerCase().includes("product") || 
      h.toLowerCase().includes("producto") ||
      h.toLowerCase().includes("asin")
    );
    
    const reviewIndex = headers.findIndex(h => 
      h.toLowerCase().includes("review") || 
      h.toLowerCase().includes("reseña") ||
      h.toLowerCase().includes("comentario") ||
      h.toLowerCase().includes("text")
    );
    
    if (productIndex === -1 || reviewIndex === -1) {
      throw new Error("El CSV debe contener columnas identificables como 'product/producto' y 'review/reseña'");
    }
    
    console.log(`Formato genérico: product=${headers[productIndex]}, review=${headers[reviewIndex]}`);
    
    return lines
      .slice(1) // Omitimos las cabeceras
      .filter(line => line.trim() !== "")
      .map((line, index) => {
        const values = line.split(",");
        if (values.length <= Math.max(productIndex, reviewIndex)) {
          console.warn("Línea con formato incorrecto:", line);
          return null;
        }
        return {
          id: `review-${index}`,
          product: values[productIndex]?.trim() || `Producto ${index}`,
          review: values[reviewIndex]?.trim() || ""
        };
      })
      .filter((item): item is ProductReview => item !== null && item.review !== "");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    // Verificamos la conexión a la API primero
    try {
      const connected = await checkAPIConnection();
      if (!connected) {
        toast.error("No se pudo conectar con la API de análisis. Verifica que el servidor Flask esté en ejecución.");
        setIsAPIConnected(false);
        return;
      }
      
      setIsAPIConnected(true);
    } catch (error) {
      toast.error("Error al verificar la conexión con la API");
      setIsAPIConnected(false);
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
      console.log("Reseñas detectadas:", reviews.slice(0, 5));
      
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
        las columnas "product/asin" y "review/review_content".
      </p>
      
      {isAPIConnected === false && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-center gap-2 text-amber-700 mb-4">
          <AlertTriangle size={20} />
          <span>No se detecta conexión con la API. Verifica que el servidor Flask esté en ejecución en <code>http://localhost:5000</code></span>
        </div>
      )}
      
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
    </div>
  );
};

export default CSVUploader;
