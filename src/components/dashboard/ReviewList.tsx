
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductReview, SentimentModel, getSentimentColor } from "../data/SentimentAPI";

interface ReviewListProps {
  reviews: ProductReview[];
  selectedModel: SentimentModel;
}

const ReviewList = ({ reviews, selectedModel }: ReviewListProps) => {
  // Función para obtener el sentimiento según el modelo seleccionado
  const getSentiment = (review: ProductReview) => {
    return selectedModel === "vader" ? review.vaderSentiment : review.textblobSentiment;
  };
  
  // Función para obtener el puntaje según el modelo seleccionado
  const getScore = (review: ProductReview) => {
    return selectedModel === "vader" ? review.vaderScore : review.textblobScore;
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Reseñas analizadas</h3>
        <p className="text-sm text-gray-500 mt-1">
          Mostrando resultados con el modelo {selectedModel === "vader" ? "VADER" : "TextBlob"}
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Producto</TableHead>
              <TableHead>Reseña</TableHead>
              <TableHead className="w-[100px] text-right">Puntaje</TableHead>
              <TableHead className="w-[120px] text-center">Sentimiento</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">{review.product}</TableCell>
                <TableCell className="max-w-md truncate">{review.review}</TableCell>
                <TableCell className="text-right">
                  {getScore(review)?.toFixed(3) || "N/A"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    className={`${getSentimentColor(getSentiment(review))} hover:${getSentimentColor(getSentiment(review))}`}
                  >
                    {getSentiment(review) || "Sin datos"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No hay reseñas para mostrar
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ReviewList;
