
// Tipos para interactuar con la API
export type SentimentModel = 'vader' | 'textblob';
export type SentimentLabel = 'Positivo' | 'Negativo' | 'Neutral';

export interface SentimentRequest {
  text: string;
  model: SentimentModel;
}

export interface SentimentResponse {
  texto: string;
  modelo: SentimentModel;
  score: number;
  sentimiento: SentimentLabel;
}

export interface ProductReview {
  id?: string;
  product: string;
  review: string;
  vaderScore?: number;
  vaderSentiment?: SentimentLabel;
  textblobScore?: number;
  textblobSentiment?: SentimentLabel;
}

export interface ProductSummary {
  product: string;
  reviewCount: number;
  vaderAvgScore: number;
  textblobAvgScore: number;
  highestScore: number;
  lowestScore: number;
}

// Funciones para interactuar con la API
const API_URL = 'http://localhost:5000';

export async function analyzeSentiment(text: string, model: SentimentModel): Promise<SentimentResponse> {
  try {
    const response = await fetch(`${API_URL}/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, model }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al analizar el sentimiento');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en la solicitud de análisis:', error);
    throw error;
  }
}

export async function processCSV(reviews: ProductReview[]): Promise<ProductReview[]> {
  // Procesamos cada reseña con ambos modelos
  const processedReviews = await Promise.all(
    reviews.map(async (review) => {
      try {
        // Análisis con VADER
        const vaderResponse = await analyzeSentiment(review.review, 'vader');
        
        // Análisis con TextBlob
        const textblobResponse = await analyzeSentiment(review.review, 'textblob');
        
        return {
          ...review,
          vaderScore: vaderResponse.score,
          vaderSentiment: vaderResponse.sentimiento,
          textblobScore: textblobResponse.score,
          textblobSentiment: textblobResponse.sentimiento,
        };
      } catch (error) {
        console.error(`Error al procesar la reseña: ${review.review}`, error);
        return review;
      }
    })
  );
  
  return processedReviews;
}

export function getSentimentColor(sentiment: SentimentLabel | undefined): string {
  if (!sentiment) return 'bg-gray-200';
  
  switch (sentiment) {
    case 'Positivo':
      return 'bg-sentiment-positive';
    case 'Neutral':
      return 'bg-sentiment-neutral';
    case 'Negativo':
      return 'bg-sentiment-negative';
    default:
      return 'bg-gray-200';
  }
}
