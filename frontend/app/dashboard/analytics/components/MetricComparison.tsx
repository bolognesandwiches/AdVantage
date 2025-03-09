'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MetricComparisonProps {
  title: string;
  metrics: Array<{
    name: string;
    campaigns: Array<{
      name: string;
      value: number;
      changePercent: number;
    }>;
  }>;
}

export default function MetricComparison({ title, metrics }: MetricComparisonProps) {
  const [selectedMetric, setSelectedMetric] = useState(metrics[0].name);

  const selectedMetricData = metrics.find((metric) => metric.name === selectedMetric);

  // Find the highest value to calculate relative bar widths
  const maxValue = selectedMetricData
    ? Math.max(...selectedMetricData.campaigns.map((camp) => camp.value))
    : 0;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-4">
        <div className="sm:flex sm:items-center mb-6">
          <div className="mb-4 sm:mb-0 sm:mr-4">
            <label htmlFor="metric" className="block text-sm font-medium text-gray-700 mb-1">
              Select Metric
            </label>
            <select
              id="metric"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              {metrics.map((metric) => (
                <option key={metric.name} value={metric.name}>
                  {metric.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedMetricData && (
          <div className="space-y-4">
            {selectedMetricData.campaigns.map((campaign, index) => (
              <div key={campaign.name} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-gray-700">{campaign.name}</span>
                  <div className="flex items-center">
                    <span className="text-sm font-medium mr-2">
                      {selectedMetricData.name === 'Win Rate' || selectedMetricData.name === 'CTR' || selectedMetricData.name === 'Viewability'
                        ? `${campaign.value}%`
                        : selectedMetricData.name === 'Bid Price' || selectedMetricData.name === 'CPM'
                        ? `$${campaign.value.toFixed(2)}`
                        : campaign.value.toLocaleString()}
                    </span>
                    <span
                      className={`text-xs ${
                        campaign.changePercent > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {campaign.changePercent > 0 ? '+' : ''}
                      {campaign.changePercent}%
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <motion.div
                    className={`h-2.5 rounded-full ${
                      index % 3 === 0
                        ? 'bg-primary-600'
                        : index % 3 === 1
                        ? 'bg-indigo-500'
                        : 'bg-purple-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(campaign.value / maxValue) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  ></motion.div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}