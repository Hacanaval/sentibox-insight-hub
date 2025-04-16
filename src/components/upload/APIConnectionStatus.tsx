
import { AlertTriangle } from "lucide-react";

interface APIConnectionStatusProps {
  isAPIConnected: boolean | null;
}

const APIConnectionStatus = ({ isAPIConnected }: APIConnectionStatusProps) => {
  if (isAPIConnected !== false) return null;
  
  return (
    <div className="bg-amber-50 border border-amber-200 p-3 rounded-md flex items-center gap-2 text-amber-700 mb-4">
      <AlertTriangle size={20} />
      <span>
        No se detecta conexión con la API. Verifica que el servidor Flask esté en ejecución en <code>http://localhost:5000</code>
      </span>
    </div>
  );
};

export default APIConnectionStatus;
