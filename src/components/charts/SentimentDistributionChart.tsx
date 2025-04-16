
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SentimentLabel } from "../data/SentimentAPI";

interface SentimentDistributionChartProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
  };
  title: string;
}

const SentimentDistributionChart = ({ data, title }: SentimentDistributionChartProps) => {
  const chartData = [
    { name: "Positivo", value: data.positive, color: "#4ade80" },
    { name: "Neutral", value: data.neutral, color: "#facc15" },
    { name: "Negativo", value: data.negative, color: "#f87171" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} reseñas`, 'Cantidad']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentDistributionChart;
