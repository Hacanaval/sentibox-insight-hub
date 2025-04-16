
import { ProductReview } from "../components/data/SentimentAPI";

/**
 * Finds the column index for review content in CSV headers
 */
export const findReviewContentIndex = (headers: string[]): number => {
  return headers.findIndex(h => 
    h.trim().toLowerCase() === 'review_content' || 
    h.trim().toLowerCase() === 'review' ||
    h.trim().toLowerCase() === 'reseña' || 
    h.trim().toLowerCase() === 'comentario' ||
    h.trim().toLowerCase() === 'text' ||
    h.trim().toLowerCase() === 'texto'
  );
};

/**
 * Finds the column index for product ID in CSV headers
 */
export const findProductIndex = (headers: string[]): number => {
  return headers.findIndex(h => 
    h.trim().toLowerCase() === 'product_id' || 
    h.trim().toLowerCase() === 'product' || 
    h.trim().toLowerCase() === 'producto' ||
    h.trim().toLowerCase() === 'asin'
  );
};

/**
 * Parses CSV text into ProductReview objects
 */
export const parseCSV = (text: string): ProductReview[] => {
  const lines = text.split("\n");
  const headers = lines[0].split(",");
  
  console.log("Encabezados detectados:", headers);

  const reviewContentIndex = findReviewContentIndex(headers);
  const productIndex = findProductIndex(headers);
  
  if (reviewContentIndex === -1) {
    throw new Error("No se encontró una columna de reseñas válida en el CSV. Debe contener una columna llamada 'review_content', 'review', 'reseña', 'comentario', 'text' o similar.");
  }
  
  const productColumnName = productIndex !== -1 ? headers[productIndex].trim() : 'Unknown Product';
  const reviewColumnName = headers[reviewContentIndex].trim();
  
  console.log(`Usando columnas: Producto=${productColumnName}, Reseña=${reviewColumnName}`);
  
  return lines
    .slice(1) // Omitimos las cabeceras
    .filter(line => line.trim() !== "")
    .map((line, index) => {
      const values = line.split(",");
      
      // Nos aseguramos de que la línea tenga suficientes columnas
      if (values.length <= Math.max(reviewContentIndex, productIndex !== -1 ? productIndex : 0)) {
        console.warn("Línea con formato incorrecto:", line);
        return null;
      }
      
      // Obtenemos el texto de la reseña y lo limpiamos
      const reviewText = values[reviewContentIndex]?.trim() || "";
      
      // Verificamos que la reseña tenga contenido significativo
      if (!reviewText || reviewText.length < 5 || /^\d+$/.test(reviewText)) {
        console.warn("Reseña inválida detectada:", reviewText);
        return null;
      }
      
      // Determinamos el producto (nombre o ID)
      const productName = productIndex !== -1 
        ? values[productIndex]?.trim() || `Producto ${index + 1}`
        : `Producto ${index + 1}`;
      
      return {
        id: `review-${index}`,
        product: productName,
        review: reviewText
      };
    })
    .filter((item): item is ProductReview => 
      item !== null && 
      item.review !== "" && 
      item.review.length > 5 &&
      !/^\d+$/.test(item.review)
    );
};
