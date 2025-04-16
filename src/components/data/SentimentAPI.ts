
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
  id: string;  // Changed from optional to required
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

// Configuración de la API
// Puedes cambiar esta URL para que apunte a tu servidor Flask, ya sea local o en la nube
export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// Función para verificar la conexión a la API
export async function checkAPIConnection(): Promise<boolean> {
  try {
    console.log(`Intentando conectar a la API en: ${API_URL}`);
    const response = await fetch(`${API_URL}/`, { 
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      // Agregamos un timeout para evitar esperas largas
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      console.log('Conexión a la API exitosa');
      return true;
    } else {
      console.error('La API respondió con error:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('Error al verificar la conexión con la API:', error);
    return false;
  }
}

// Funciones para interactuar con la API
export async function analyzeSentiment(text: string, model: SentimentModel): Promise<SentimentResponse> {
  try {
    console.log(`Analizando texto con modelo ${model}:`, text);
    const response = await fetch(`${API_URL}/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ text, model }),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Resultado del análisis:', data);
    return data;
  } catch (error) {
    console.error('Error en la solicitud de análisis:', error);
    throw error;
  }
}

export async function processCSV(reviews: ProductReview[]): Promise<ProductReview[]> {
  // Verificamos la conexión primero
  const isConnected = await checkAPIConnection();
  if (!isConnected) {
    throw new Error('No se pudo conectar con la API de análisis. Verifica que el servidor Flask esté en ejecución.');
  }

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
      return 'bg-green-500 text-white hover:bg-green-600';
    case 'Neutral':
      return 'bg-amber-400 text-white hover:bg-amber-500';
    case 'Negativo':
      return 'bg-red-500 text-white hover:bg-red-600';
    default:
      return 'bg-gray-200';
  }
}
