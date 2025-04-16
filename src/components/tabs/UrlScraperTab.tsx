
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

const UrlScraperTab = () => {
  return (
    <div className="animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle>Análisis de URLs (Próximamente)</CardTitle>
          <CardDescription>
            Esta función estará disponible en una próxima actualización
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-6 border border-dashed border-gray-300">
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <Link2 className="w-12 h-12 mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Análisis desde URL
              </h3>
              <p className="max-w-md text-center mb-4">
                Próximamente podrás pegar una URL de un producto (Amazon, Google Reviews)
                y analizaremos automáticamente todas las reseñas disponibles.
              </p>
              
              <div className="w-full max-w-md flex gap-3 opacity-60 pointer-events-none">
                <Input placeholder="https://amazon.com/product/..." disabled />
                <Button disabled>Analizar</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UrlScraperTab;
