'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/AuthContext';
import PerformanceChart from './components/PerformanceChart';

// Types for the components
interface Column {
  header: string;
  accessor: string;
  sortable?: boolean;
}

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

interface DataGridProps {
  title: string;
  columns: Column[];
  data: Record<string, any>[];
  pageSize?: number;
}

interface Campaign {
  name: string;
  value: number;
  changePercent: number;
}

interface MetricData {
  name: string;
  campaigns: Campaign[];
}

interface MetricComparisonProps {
  title: string;
  metrics: MetricData[];
}

// Mock data for analytics visualizations
const bidData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  bidPrices: [0.42, 0.45, 0.39, 0.51, 0.46, 0.48, 0.52],
  winRates: [22, 24, 21, 28, 26, 25, 29],
};

// Create formatted data for the chart
const performanceData = bidData.labels.map((month, index) => ({
  name: month,
  bidPrice: bidData.bidPrices[index],
  winRate: bidData.winRates[index]
}));

// Chart series configuration
const performanceSeries = [
  { dataKey: 'bidPrice', color: '#3B82F6', name: 'Bid Price ($)' },
  { dataKey: 'winRate', color: '#10B981', name: 'Win Rate (%)' }
];

// Additional mock data for impression volume 
const impressionVolumeData = [
  { name: 'Jan', impressions: 1200000, clicks: 24000 },
  { name: 'Feb', impressions: 1450000, clicks: 27500 },
  { name: 'Mar', impressions: 1350000, clicks: 24300 },
  { name: 'Apr', impressions: 1650000, clicks: 33000 },
  { name: 'May', impressions: 1550000, clicks: 31000 },
  { name: 'Jun', impressions: 1750000, clicks: 38500 },
  { name: 'Jul', impressions: 1850000, clicks: 44400 },
];

const impressionSeries = [
  { dataKey: 'impressions', color: '#6366F1', name: 'Impressions' },
  { dataKey: 'clicks', color: '#EC4899', name: 'Clicks' }
];

// Mock tabular data for the DataGrid component
const bidHistoryData = [
  { date: '2024-07-01', domain: 'example.com', bidPrice: '$0.42', winRate: '22%', impressions: '125K', campaign: 'Campaign 1' },
  { date: '2024-07-02', domain: 'news.com', bidPrice: '$0.37', winRate: '19%', impressions: '98K', campaign: 'Campaign 1' },
  { date: '2024-07-03', domain: 'blog.net', bidPrice: '$0.51', winRate: '24%', impressions: '145K', campaign: 'Campaign 2' },
  { date: '2024-07-04', domain: 'social.io', bidPrice: '$0.44', winRate: '20%', impressions: '110K', campaign: 'Campaign 3' },
  { date: '2024-07-05', domain: 'video.com', bidPrice: '$0.62', winRate: '31%', impressions: '202K', campaign: 'Campaign 2' },
  { date: '2024-07-06', domain: 'search.net', bidPrice: '$0.39', winRate: '18%', impressions: '87K', campaign: 'Campaign 1' },
  { date: '2024-07-07', domain: 'shop.com', bidPrice: '$0.55', winRate: '26%', impressions: '176K', campaign: 'Campaign 3' },
  { date: '2024-07-08', domain: 'tech.io', bidPrice: '$0.49', winRate: '23%', impressions: '134K', campaign: 'Campaign 2' },
  { date: '2024-07-09', domain: 'gaming.net', bidPrice: '$0.57', winRate: '27%', impressions: '189K', campaign: 'Campaign 3' },
  { date: '2024-07-10', domain: 'finance.com', bidPrice: '$0.45', winRate: '21%', impressions: '121K', campaign: 'Campaign 1' },
  { date: '2024-07-11', domain: 'health.org', bidPrice: '$0.53', winRate: '25%', impressions: '156K', campaign: 'Campaign 2' },
  { date: '2024-07-12', domain: 'travel.net', bidPrice: '$0.47', winRate: '22%', impressions: '131K', campaign: 'Campaign 1' },
];

// Bid history table columns
const bidHistoryColumns: Column[] = [
  { header: 'Date', accessor: 'date', sortable: true },
  { header: 'Domain', accessor: 'domain', sortable: true },
  { header: 'Bid Price', accessor: 'bidPrice', sortable: true },
  { header: 'Win Rate', accessor: 'winRate', sortable: true },
  { header: 'Impressions', accessor: 'impressions', sortable: true },
  { header: 'Campaign', accessor: 'campaign', sortable: true },
];

// Campaign metric comparison data
const comparisonMetrics: MetricData[] = [
  {
    name: 'Win Rate',
    campaigns: [
      { name: 'Campaign 1', value: 21, changePercent: -2.3 },
      { name: 'Campaign 2', value: 26, changePercent: 5.1 },
      { name: 'Campaign 3', value: 25, changePercent: 1.8 },
    ],
  },
  {
    name: 'Bid Price',
    campaigns: [
      { name: 'Campaign 1', value: 0.41, changePercent: -4.7 },
      { name: 'Campaign 2', value: 0.57, changePercent: 3.2 },
      { name: 'Campaign 3', value: 0.48, changePercent: 0.5 },
    ],
  },
  {
    name: 'CTR',
    campaigns: [
      { name: 'Campaign 1', value: 0.8, changePercent: 2.1 },
      { name: 'Campaign 2', value: 0.6, changePercent: -1.8 },
      { name: 'Campaign 3', value: 0.9, changePercent: 4.5 },
    ],
  },
  {
    name: 'Viewability',
    campaigns: [
      { name: 'Campaign 1', value: 72, changePercent: 1.5 },
      { name: 'Campaign 2', value: 65, changePercent: -2.1 },
      { name: 'Campaign 3', value: 78, changePercent: 3.8 },
    ],
  },
];

// Filter options
const timeRanges = ['Last 7 Days', 'Last 30 Days', 'Last 90 Days', 'Year to Date', 'Custom Range'];
const campaigns = ['All Campaigns', 'Campaign 1', 'Campaign 2', 'Campaign 3'];
const metrics = ['Bid Price', 'Win Rate', 'Impressions', 'CTR', 'Viewability'];

// Integrated DataGrid component
function DataGrid({ title, columns, data, pageSize = 10 }: DataGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  });

  // Calculate pagination
  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentData = data.slice(startIndex, endIndex);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    if (!sortConfig.key) return currentData;
    
    return [...currentData].sort((a, b) => {
      if (a[sortConfig.key!] < b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key!] > b[sortConfig.key!]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const sortedData = getSortedData();

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.accessor}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable && requestSort(column.accessor)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && sortConfig.key === column.accessor && (
                      <span className="ml-1">
                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={`${rowIndex}-${column.accessor}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                  >
                    {row[column.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between items-center">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <div className="hidden md:block">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(endIndex, data.length)}
                </span>{' '}
                of <span className="font-medium">{data.length}</span> results
              </p>
            </div>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Integrated MetricComparison component
function MetricComparison({ title, metrics }: MetricComparisonProps) {
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

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRanges[0]);
  const [selectedCampaign, setSelectedCampaign] = useState(campaigns[0]);
  const [selectedMetrics, setSelectedMetrics] = useState([metrics[0], metrics[1]]);
  const [hasFiles, setHasFiles] = useState(false);

  useEffect(() => {
    // Check if the user has uploaded any files
    const lastUpload = localStorage.getItem('lastUploadDate');
    setHasFiles(!!lastUpload);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-8">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Analytics Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Analyze and visualize your DSP campaign performance metrics.
          </p>
        </div>
      </div>

      {!hasFiles ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8"
        >
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                No log data available for analysis. Upload DSP logs to see analytics and insights.
                <a href="/dashboard/upload" className="font-medium underline text-yellow-700 hover:text-yellow-600 ml-2">
                  Upload logs
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Filters Section */}
          <div className="bg-white p-6 shadow rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="timeRange" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Range
                </label>
                <select
                  id="timeRange"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                >
                  {timeRanges.map((range) => (
                    <option key={range} value={range}>
                      {range}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="campaign" className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign
                </label>
                <select
                  id="campaign"
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedCampaign}
                  onChange={(e) => setSelectedCampaign(e.target.value)}
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign} value={campaign}>
                      {campaign}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Metrics</label>
                <div className="flex flex-wrap gap-2">
                  {metrics.map((metric) => (
                    <label key={metric} className="inline-flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        checked={selectedMetrics.includes(metric)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMetrics([...selectedMetrics, metric]);
                          } else {
                            setSelectedMetrics(selectedMetrics.filter((m) => m !== metric));
                          }
                        }}
                      />
                      <span className="ml-1 mr-3 text-sm text-gray-700">{metric}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chart Section - Replace placeholder with actual charts */}
          <div className="space-y-6 mb-6">
            <PerformanceChart
              title="Bid Performance Metrics"
              data={performanceData}
              series={performanceSeries}
              type="line"
              height={350}
              yAxisLabel="Value"
              xAxisLabel="Month"
            />
            
            <PerformanceChart
              title="Impression Volume"
              data={impressionVolumeData}
              series={impressionSeries}
              type="area"
              height={350}
              yAxisLabel="Count"
              xAxisLabel="Month"
            />
          </div>

          {/* Campaign Comparison Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <MetricComparison
              title="Campaign Comparison"
              metrics={comparisonMetrics}
            />
          </motion.div>

          {/* Metrics Summary Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Bid Performance</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Average Bid Price</span>
                  <span className="font-medium">${bidData.bidPrices[bidData.bidPrices.length - 1]}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Bid Price Range</span>
                  <span className="font-medium">
                    ${Math.min(...bidData.bidPrices)} - ${Math.max(...bidData.bidPrices)}
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Bid Volume</span>
                  <span className="font-medium">2.4M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Clearing Price Delta</span>
                  <span className="font-medium text-green-600">-8.3%</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 shadow rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Win Rate Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Average Win Rate</span>
                  <span className="font-medium">{bidData.winRates[bidData.winRates.length - 1]}%</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Win Rate Range</span>
                  <span className="font-medium">
                    {Math.min(...bidData.winRates)}% - {Math.max(...bidData.winRates)}%
                  </span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Win Volume</span>
                  <span className="font-medium">765K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Win Rate Trend</span>
                  <span className="font-medium text-green-600">+2.8%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <DataGrid
              title="Bid History"
              columns={bidHistoryColumns}
              data={bidHistoryData}
              pageSize={5}
            />
          </motion.div>

          {/* Recommendations Section */}
          <div className="bg-white p-6 shadow rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Recommendations</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Consider increasing bid prices by 5-7% during peak hours (10 AM - 2 PM) to improve win rates.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Reduce bid prices for inventory with high frequency (5+ impressions) as conversion rates drop significantly.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Optimize supply path by focusing on direct exchanges, which show 15% better performance than resellers.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-green-500">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-700">Implement frequency capping at 3 impressions per user per day to improve overall campaign efficiency.</p>
                </div>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
} 