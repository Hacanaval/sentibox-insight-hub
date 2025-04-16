
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageLayout from "@/components/layout/PageLayout";
import CSVUploader from "@/components/upload/CSVUploader";
import SentimentDashboard from "@/components/dashboard/SentimentDashboard";
import SentimentAnalyzer from "@/components/sentiment/SentimentAnalyzer";
import UrlScraperTab from "@/components/tabs/UrlScraperTab";
import { ProductReview } from "@/components/data/SentimentAPI";

const Index = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDataProcessed = (processedReviews: ProductReview[]) => {
    setReviews(processedReviews);
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
