
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Meh, Frown, AlertTriangle } from "lucide-react";
import { SentimentModel, SentimentResponse, analyzeSentiment, getSentimentColor, checkAPIConnection } from "../data/SentimentAPI";
import { toast } from "sonner";

const SentimentAnalyzer = () => {
  const [text, setText] = useState("");
  const [model, setModel] = useState<SentimentModel>("vader");
  const [result, setResult] = useState<SentimentResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAPIConnected, setIsAPIConnected] = useState<boolean | null>(null);

  // Verificar la conexión a la API al montar el componente
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const connected = await checkAPIConnection();
        setIsAPIConnected(connected);
        if (!connected) {
          toast.error("No se pudo conectar con la API de análisis. Verifica que el servidor Flask esté en ejecución.", {
            duration: 10000,
          });
        }
      } catch (error) {
        console.error("Error al verificar la conexión:", error);
        setIsAPIConnected(false);
      }
    };

    verifyConnection();
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Verificamos la conexión antes de intentar analizar
      const connected = await checkAPIConnection();
      if (!connected) {
        toast.error("No se pudo conectar con la API de análisis. Verifica que el servidor Flask esté en ejecución.");
        setIsAPIConnected(false);
        setIsAnalyzing(false);
        return;
      }
      
      setIsAPIConnected(true);
      const response = await analyzeSentiment(text, model);
      setResult(response);
      toast.success("Análisis de sentimiento completado");
    } catch (error) {
      console.error("Error al analizar el texto:", error);
      toast.error(`Error al analizar: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentIcon = () => {
    if (!result) return null;
    
    switch (result.sentimiento) {
      case "Positivo":
        return <Smile className="h-12 w-12 text-sentiment-positive" />;
      case "Neutral":
        return <Meh className="h-12 w-12 text-sentiment-neutral" />;
      case "Negativo":
        return <Frown className="h-12 w-12 text-sentiment-negative" />;
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Análisis de texto</CardTitle>
          <CardDescription>
            Ingresa un texto para analizarlo utilizando los modelos de sentimiento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAPIConnected === false && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-center gap-2 text-amber-700 mb-4">
              <AlertTriangle size={20} />
              <span>No se detecta conexión con la API. Verifica que el servidor Flask esté en ejecución en <code>http://localhost:5000</code></span>
            </div>
          )}
          
          <Textarea
            placeholder="Escribe o pega el texto que deseas analizar..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="resize-none"
          />
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Selecciona el modelo:</div>
            <RadioGroup 
              value={model} 
              onValueChange={(value) => setModel(value as SentimentModel)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vader" id="vader" />
                <Label htmlFor="vader">VADER</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="textblob" id="textblob" />
                <Label htmlFor="textblob">TextBlob</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing || isAPIConnected === false}
            className="w-full"
          >
            {isAnalyzing ? "Analizando..." : "Analizar Sentimiento"}
          </Button>
        </CardContent>
      </Card>
      
      <Card className={result ? "bg-slate-50" : "bg-white"}>
        <CardHeader>
          <CardTitle>Resultado del análisis</CardTitle>
          <CardDescription>
            {result 
              ? `Análisis realizado con ${result.modelo === "vader" ? "VADER" : "TextBlob"}`
              : "Los resultados aparecerán aquí"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                {getSentimentIcon()}
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {result.sentimiento}
                </div>
                <div className="text-lg text-gray-700">
                  Puntaje: {result.score.toFixed(3)}
                </div>
              </div>
              
              <div className="relative pt-4">
                <div className="flex h-2 mb-4 overflow-hidden text-xs bg-gray-200 rounded">
                  <div className={`${getSentimentColor(result.sentimiento)} w-1/3 absolute h-2 transition-all duration-500`} 
                       style={{ 
                         left: `${((result.score + 1) / 2) * 100}%`, 
                         transform: 'translateX(-50%)',
                         width: '8px'
                       }}></div>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>-1.0</span>
                  <span>0.0</span>
                  <span>1.0</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Muy Negativo</span>
                  <span>Neutral</span>
                  <span>Muy Positivo</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              Ingresa un texto y presiona "Analizar Sentimiento" para ver los resultados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentAnalyzer;
