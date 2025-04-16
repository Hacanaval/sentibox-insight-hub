
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductReview, ProductSummary, SentimentModel } from "../data/SentimentAPI";
import { Badge } from "@/components/ui/badge";

interface ProductStatsProps {
  reviews: ProductReview[];
  selectedModel: SentimentModel;
}

const ProductStats = ({ reviews, selectedModel }: ProductStatsProps) => {
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
  const getSentimentStatus = (score: number) => {
    if (score > 0.05) return "Positivo";
    if (score < -0.05) return "Negativo";
    return "Neutral";
  };

  // Determinamos el color según el sentimiento
  const getSentimentColor = (score: number) => {
    if (score > 0.05) return "bg-sentiment-positive hover:bg-sentiment-positive/80";
    if (score < -0.05) return "bg-sentiment-negative hover:bg-sentiment-negative/80";
    return "bg-sentiment-neutral hover:bg-sentiment-neutral/80";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas de productos</CardTitle>
        <CardDescription>
          Resumen del análisis de sentimiento por producto
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {productStats.map((stats) => {
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
                    <Badge className={getSentimentColor(avgScore)}>
                      {sentimentStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Puntaje promedio</div>
                    <div className="font-semibold">{avgScore.toFixed(3)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500">Rango</div>
                    <div className="font-semibold">
                      {stats.lowestScore.toFixed(2)} / {stats.highestScore.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductStats;
