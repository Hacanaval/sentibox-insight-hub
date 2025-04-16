
import { ReactNode, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { checkAPIConnection, API_URL } from "../data/SentimentAPI";

type PageLayoutProps = {
  children: ReactNode;
  title: string;
  description?: string;
};

const PageLayout = ({ children, title, description }: PageLayoutProps) => {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await checkAPIConnection();
        setApiStatus(connected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error("Error al verificar la conexión con la API:", error);
        setApiStatus('disconnected');
      }
    };

    checkConnection();
    
    // Verificar la conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              {description && <p className="mt-2 text-gray-600">{description}</p>}
            </div>
            <div className="mt-4 sm:mt-0">
              <Badge
                variant="outline"
                className={`flex items-center gap-1.5 px-2 py-1 ${
                  apiStatus === 'connected'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : apiStatus === 'disconnected'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    apiStatus === 'connected'
                      ? 'bg-green-500'
                      : apiStatus === 'disconnected'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
                {apiStatus === 'connected'
                  ? 'API Conectada'
                  : apiStatus === 'disconnected'
                  ? 'API Desconectada'
                  : 'Verificando API...'}
              </Badge>
              <div className="text-xs text-gray-500 mt-1">
                {API_URL}
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default PageLayout;
