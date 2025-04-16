
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductReview, ProductSummary, SentimentLabel, SentimentModel, getSentimentColor } from "../data/SentimentAPI";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductStatsProps {
  reviews: ProductReview[];
  selectedModel: SentimentModel;
}

const ProductStats = ({ reviews, selectedModel }: ProductStatsProps) => {
  const [filterText, setFilterText] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<SentimentLabel | "all">("all");

  // Si no hay reseñas, mostramos un mensaje
  if (reviews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de productos</CardTitle>
          <CardDescription>No hay datos para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Carga un archivo CSV con reseñas para ver las estadísticas
          </p>
        </CardContent>
      </Card>
    );
  }

  // Agrupamos las reseñas por producto
  const productGroups = reviews.reduce((groups: Record<string, ProductReview[]>, review) => {
    if (!groups[review.product]) {
      groups[review.product] = [];
    }
    groups[review.product].push(review);
    return groups;
  }, {});

  // Calculamos estadísticas por producto
  const productStats: ProductSummary[] = Object.entries(productGroups).map(([product, productReviews]) => {
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

  // Ordenamos por cantidad de reseñas (descendente)
  productStats.sort((a, b) => b.reviewCount - a.reviewCount);

  // Determinamos el estado de sentimiento para un puntaje
  const getSentimentStatus = (score: number): SentimentLabel => {
    if (score > 0.05) return "Positivo";
    if (score < -0.05) return "Negativo";
    return "Neutral";
  };

  // Filtramos los productos según el texto de búsqueda y el filtro de sentimiento
  const filteredProductStats = productStats.filter((stats) => {
    // Filtro por texto
    const matchesText = stats.product.toLowerCase().includes(filterText.toLowerCase());
    
    // Filtro por sentimiento
    if (sentimentFilter === "all") {
      return matchesText;
    }
    
    const avgScore = selectedModel === "vader" ? stats.vaderAvgScore : stats.textblobAvgScore;
    const sentimentStatus = getSentimentStatus(avgScore);
    return matchesText && sentimentStatus === sentimentFilter;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de productos</CardTitle>
        <CardDescription>
          Resumen del análisis de sentimiento por producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Buscar producto..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select 
            value={sentimentFilter} 
            onValueChange={(value) => setSentimentFilter(value as SentimentLabel | "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filtrar por sentimiento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los sentimientos</SelectItem>
              <SelectItem value="Positivo">Positivo</SelectItem>
              <SelectItem value="Neutral">Neutral</SelectItem>
              <SelectItem value="Negativo">Negativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-4">
          {filteredProductStats.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No se encontraron productos con los criterios de búsqueda</p>
          ) : (
            filteredProductStats.map((stats) => {
              const avgScore = selectedModel === "vader" ? stats.vaderAvgScore : stats.textblobAvgScore;
              const sentimentStatus = getSentimentStatus(avgScore);
              
              return (
                <div 
                  key={stats.product} 
                  className="p-4 border rounded-lg flex flex-col md:flex-row md:items-center gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{stats.product}</h4>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-gray-600">
                        {stats.reviewCount} reseñas
                      </Badge>
                      <Badge className={getSentimentColor(sentimentStatus)}>
                        {sentimentStatus}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Sentimiento</div>
                      <div className="font-semibold">
                        <Badge className={`${getSentimentColor(sentimentStatus)} mt-1`}>
                          {sentimentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStats;
