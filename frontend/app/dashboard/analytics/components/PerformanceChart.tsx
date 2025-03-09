'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number; // Additional metrics as key-value pairs
}

export interface ChartSeries {
  dataKey: string;
  color: string;
  name: string;
}

export interface PerformanceChartProps {
  title: string;
  data: ChartDataPoint[];
  series: ChartSeries[];
  type?: 'line' | 'area' | 'bar';
  height?: number | string;
  yAxisLabel?: string;
  xAxisLabel?: string;
}

export default function PerformanceChart({
  title,
  data,
  series,
  type = 'line',
  height = 400,
  yAxisLabel,
  xAxisLabel
}: PerformanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Animation settings for chart elements
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Helper function to format numbers for tooltips
  const formatValue = (value: number) => {
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value > 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
          <p className="text-gray-600 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p 
              key={`tooltip-${index}`} 
              style={{ color: entry.color }}
              className="text-sm"
            >
              {entry.name}: {
                typeof entry.value === 'number' 
                  ? entry.payload[entry.dataKey] >= 1 
                    ? formatValue(entry.value) 
                    : entry.value.toFixed(2)
                  : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Render the appropriate chart type
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280' }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} 
            />
            <YAxis 
              tick={{ fill: '#6B7280' }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {series.map((s, i) => (
              <Area
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                fill={s.color}
                fillOpacity={0.3}
                activeDot={{ r: 6, onMouseOver: () => setActiveIndex(i) }}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280' }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} 
            />
            <YAxis 
              tick={{ fill: '#6B7280' }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {series.map((s) => (
              <Bar
                key={s.dataKey}
                dataKey={s.dataKey}
                name={s.name}
                fill={s.color}
                animationDuration={1500}
                animationEasing="ease-out"
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6B7280' }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false}
              label={xAxisLabel ? { value: xAxisLabel, position: 'insideBottom', offset: -5 } : undefined} 
            />
            <YAxis 
              tick={{ fill: '#6B7280' }} 
              axisLine={{ stroke: '#E5E7EB' }} 
              tickLine={false} 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {series.map((s, i) => (
              <Line
                key={s.dataKey}
                type="monotone"
                dataKey={s.dataKey}
                name={s.name}
                stroke={s.color}
                activeDot={{ r: 6, onMouseOver: () => setActiveIndex(i) }}
                animationDuration={1500}
                animationEasing="ease-out"
                strokeWidth={2}
                dot={{ r: 3, fill: s.color, stroke: s.color }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.6 }}
      className="bg-white shadow rounded-lg overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-6">
        <ResponsiveContainer width="100%" height={height}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
} 