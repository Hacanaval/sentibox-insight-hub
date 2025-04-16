
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductReview, SentimentLabel, SentimentModel } from "../data/SentimentAPI";
import SentimentDistributionChart from "../charts/SentimentDistributionChart";
import ScoreComparisonChart from "../charts/ScoreComparisonChart";
import ReviewList from "./ReviewList";
import ProductStats from "./ProductStats";

interface SentimentDashboardProps {
  reviews: ProductReview[];
}

const SentimentDashboard = ({ reviews }: SentimentDashboardProps) => {
  const [selectedModel, setSelectedModel] = useState<SentimentModel>("vader");
  
  // Calculamos estadísticas para los gráficos
  const calculateStats = () => {
    // Contamos por sentimiento
    const vaderCounts = {
      positive: reviews.filter(r => r.vaderSentiment === "Positivo").length,
      neutral: reviews.filter(r => r.vaderSentiment === "Neutral").length,
      negative: reviews.filter(r => r.vaderSentiment === "Negativo").length,
    };
    
    const textblobCounts = {
      positive: reviews.filter(r => r.textblobSentiment === "Positivo").length,
      neutral: reviews.filter(r => r.textblobSentiment === "Neutral").length,
      negative: reviews.filter(r => r.textblobSentiment === "Negativo").length,
    };
    
    // Agrupamos por producto para el gráfico de comparación
    const productGroups = reviews.reduce((groups: Record<string, ProductReview[]>, review) => {
      if (!groups[review.product]) {
        groups[review.product] = [];
      }
      groups[review.product].push(review);
      return groups;
    }, {});
    
    const productStats = Object.entries(productGroups).map(([product, productReviews]) => {
      // Calculamos promedios para VADER
      const vaderScores = productReviews
        .map(review => review.vaderScore)
        .filter((score): score is number => score !== undefined);
      
      const vaderAvgScore = vaderScores.length > 0
        ? vaderScores.reduce((sum, score) => sum + score, 0) / vaderScores.length
        : 0;
      
      // Calculamos promedios para TextBlob
      const textblobScores = productReviews
        .map(review => review.textblobScore)
        .filter((score): score is number => score !== undefined);
      
      const textblobAvgScore = textblobScores.length > 0
        ? textblobScores.reduce((sum, score) => sum + score, 0) / textblobScores.length
        : 0;
      
      // Combinamos los puntajes para obtener el máximo y mínimo
      const allScores = [...vaderScores, ...textblobScores];
      const highestScore = Math.max(...allScores);
      const lowestScore = Math.min(...allScores);
      
      return {
        product,
        reviewCount: productReviews.length,
        vaderAvgScore,
        textblobAvgScore,
        highestScore,
        lowestScore
      };
    });
    
    return {
      vaderCounts,
      textblobCounts,
      productStats
    };
  };
  
  const stats = calculateStats();
  
  if (reviews.length === 0) {
    return (
      <div className="animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard de Sentimiento</CardTitle>
            <CardDescription>
              Carga un archivo CSV con reseñas para comenzar el análisis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <p className="max-w-md text-center">
                Aún no hay datos para mostrar. Utiliza la pestaña de "Carga de CSV" 
                para subir un archivo con reseñas de productos y analizar su sentimiento.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard de Sentimiento
          </h2>
          <p className="text-gray-600 mt-1">
            {reviews.length} reseñas analizadas
          </p>
        </div>
        
        <div className="w-full sm:w-auto">
          <Select
            value={selectedModel}
            onValueChange={(value) => setSelectedModel(value as SentimentModel)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Seleccionar modelo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vader">VADER</SelectItem>
              <SelectItem value="textblob">TextBlob</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SentimentDistributionChart
          data={selectedModel === "vader" ? stats.vaderCounts : stats.textblobCounts}
          title={`Distribución de Sentimiento (${selectedModel === "vader" ? "VADER" : "TextBlob"})`}
        />
        <ScoreComparisonChart data={stats.productStats} />
      </div>
      
      <ProductStats reviews={reviews} selectedModel={selectedModel} />
      
      <ReviewList reviews={reviews} selectedModel={selectedModel} />
    </div>
  );
};

export default SentimentDashboard;
