
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ProductSummary } from "../data/SentimentAPI";

interface ScoreComparisonChartProps {
  data: ProductSummary[];
}

const ScoreComparisonChart = ({ data }: ScoreComparisonChartProps) => {
  const chartData = data.map(item => ({
    product: item.product,
    VADER: parseFloat(item.vaderAvgScore.toFixed(2)),
    TextBlob: parseFloat(item.textblobAvgScore.toFixed(2)),
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Comparación de Modelos</h3>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="product" />
          <YAxis domain={[-1, 1]} />
          <Tooltip formatter={(value) => [`${value}`, 'Puntaje']} />
          <Legend />
          <Bar dataKey="VADER" fill="#8884d8" name="VADER" />
          <Bar dataKey="TextBlob" fill="#82ca9d" name="TextBlob" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreComparisonChart;
