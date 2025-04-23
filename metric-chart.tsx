"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '@/data-transformers';

/**
 * Reusable line chart component for visualizing running metrics
 */
interface MetricChartProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  name: string;
  color?: string;
  yAxisLabel?: string;
  tooltipFormatter?: (value: any) => [React.ReactNode, string];
  height?: number;
}

export function MetricChart({
  data,
  dataKey,
  xAxisKey = 'week',
  name,
  color = '#FC4C02',
  yAxisLabel,
  tooltipFormatter,
  height = 400,
}: MetricChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  // Format dates for x-axis if the xAxisKey is a date
  const formattedData = data.map(item => {
    if (xAxisKey === 'week' || xAxisKey === 'date') {
      return {
        ...item,
        formattedDate: formatDate(item[xAxisKey]),
      };
    }
    return item;
  });

  return (
    <div className="w-full bg-white p-4 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">{name}</h3>
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <LineChart
            data={formattedData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey === 'week' || xAxisKey === 'date' ? 'formattedDate' : xAxisKey} 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={tooltipFormatter || ((value) => [value, name])}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={color}
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
