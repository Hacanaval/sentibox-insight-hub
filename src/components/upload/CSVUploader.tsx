
import { ChangeEvent, useState, useEffect } from "react";
import { toast } from "sonner";
import { ProductReview, processCSV, checkAPIConnection } from "../data/SentimentAPI";
import { parseCSV } from "@/utils/csvUtils";
import APIConnectionStatus from "./APIConnectionStatus";
import FileUploadInterface from "./FileUploadInterface";

interface CSVUploaderProps {
  onDataProcessed: (data: ProductReview[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
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
        toast.error("No se encontraron reseñas válidas en el archivo. Verifica que el CSV contenga una columna con textos de reseñas (no solo IDs o números).");
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
        una columna con textos de reseñas como 'review_content', 'review', 'texto', etc.
      </p>
      
      <APIConnectionStatus isAPIConnected={isAPIConnected} />
      
      <FileUploadInterface 
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        file={file}
        isLoading={isLoading}
        isAPIConnected={isAPIConnected}
      />
    </div>
  );
};

export default CSVUploader;
