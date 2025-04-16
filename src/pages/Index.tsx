
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/layout/PageLayout";
import CSVUploader from "@/components/upload/CSVUploader";
import SentimentDashboard from "@/components/dashboard/SentimentDashboard";
import SentimentAnalyzer from "@/components/sentiment/SentimentAnalyzer";
import UrlScraperTab from "@/components/tabs/UrlScraperTab";
import { ProductReview } from "@/components/data/SentimentAPI";
import { toast } from "sonner";

const Index = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataProcessed = (processedReviews: ProductReview[]) => {
    // Verificamos que tengamos reseñas válidas (con texto real, no solo IDs)
    const validReviews = processedReviews.filter(
      r => r.review && r.review.length > 5 && !/^\d+$/.test(r.review)
    );
    
    if (validReviews.length === 0) {
      toast.error("No se encontraron reseñas válidas para mostrar. Verifica que el archivo CSV contenga textos de reseñas reales.");
      return;
    }
    
    setReviews(validReviews);
    
    // Mostrar estadísticas rápidas del análisis
    const totalReviews = validReviews.length;
    const vaderPositive = validReviews.filter(r => r.vaderSentiment === "Positivo").length;
    const vaderNeutral = validReviews.filter(r => r.vaderSentiment === "Neutral").length;
    const vaderNegative = validReviews.filter(r => r.vaderSentiment === "Negativo").length;
    
    console.log("Estadísticas de sentimiento:", {
      total: totalReviews,
      positivo: vaderPositive,
      neutral: vaderNeutral,
      negativo: vaderNegative
    });
    
    toast.success(
      <div className="space-y-1">
        <div className="font-semibold">Análisis completado</div>
        <div className="text-sm">
          Total: {totalReviews} reseñas<br/>
          Positivas: {vaderPositive} ({Math.round(vaderPositive/totalReviews*100)}%)<br/>
          Neutrales: {vaderNeutral} ({Math.round(vaderNeutral/totalReviews*100)}%)<br/>
          Negativas: {vaderNegative} ({Math.round(vaderNegative/totalReviews*100)}%)
        </div>
      </div>,
      { duration: 6000 }
    );
  };

  return (
    <PageLayout 
      title="SentiBox: Análisis de Sentimiento" 
      description="Analiza el sentimiento de tus reseñas de productos utilizando modelos de IA"
    >
      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid grid-cols-3 max-w-md mx-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="text">Texto</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <CSVUploader 
            onDataProcessed={handleDataProcessed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
          <SentimentDashboard reviews={reviews} />
        </TabsContent>
        
        <TabsContent value="text">
          <SentimentAnalyzer />
        </TabsContent>
        
        <TabsContent value="url">
          <UrlScraperTab />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
};

export default Index;
