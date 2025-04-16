
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductReview, SentimentModel, getSentimentColor } from "../data/SentimentAPI";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewListProps {
  reviews: ProductReview[];
  selectedModel: SentimentModel;
}

const ReviewList = ({ reviews, selectedModel }: ReviewListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState<"all" | "Positivo" | "Negativo" | "Neutral">("all");
  
  // Función para obtener el sentimiento según el modelo seleccionado
  const getSentiment = (review: ProductReview) => {
    return selectedModel === "vader" ? review.vaderSentiment : review.textblobSentiment;
  };
  
  // Función para obtener el puntaje según el modelo seleccionado
  const getScore = (review: ProductReview) => {
    return selectedModel === "vader" ? review.vaderScore : review.textblobScore;
  };

  // Filtrar reseñas según búsqueda y filtro de sentimiento
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.product.toLowerCase().includes(searchQuery.toLowerCase()) || 
      review.review.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSentiment = sentimentFilter === "all" || getSentiment(review) === sentimentFilter;
    
    return matchesSearch && matchesSentiment;
  });

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium text-gray-900">Reseñas analizadas</h3>
        <p className="text-sm text-gray-500 mt-1">
          Mostrando resultados con el modelo {selectedModel === "vader" ? "VADER" : "TextBlob"}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por producto o reseña..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Select
            value={sentimentFilter}
            onValueChange={(value) => setSentimentFilter(value as any)}
          >
            <SelectTrigger className="w-full sm:w-[200px]">
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
            {filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.product}</TableCell>
                  <TableCell className="max-w-md truncate">{review.review}</TableCell>
                  <TableCell className="text-right">
                    {getScore(review)?.toFixed(3) || "N/A"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      className={getSentimentColor(getSentiment(review))}
                    >
                      {getSentiment(review) || "Sin datos"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  {searchQuery || sentimentFilter !== "all" 
                    ? "No se encontraron reseñas con los filtros aplicados" 
                    : "No hay reseñas para mostrar"}
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
