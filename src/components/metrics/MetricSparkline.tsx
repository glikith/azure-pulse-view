import React from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface MetricSparklineProps {
  data: number[];
  color?: string;
}

const MetricSparkline: React.FC<MetricSparklineProps> = React.memo(({ data, color = 'hsl(207, 90%, 42%)' }) => {
  const chartData = data.map((v, i) => ({ idx: i, value: v }));
  const min = Math.min(...data);
  const max = Math.max(...data);

  return (
    <div className="h-8 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={[min * 0.9, max * 1.1]} hide />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

MetricSparkline.displayName = 'MetricSparkline';
export default MetricSparkline;
