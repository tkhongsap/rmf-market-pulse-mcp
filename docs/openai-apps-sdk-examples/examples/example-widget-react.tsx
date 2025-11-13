/**
 * Example React Widget for OpenAI Apps SDK
 * File: src/rmf-fund-detail/main.tsx
 *
 * This example demonstrates:
 * - Creating a React widget with TypeScript
 * - Using Tailwind CSS for styling
 * - Handling widget props and data
 * - Rendering structured fund data
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================================================
// Type Definitions
// ============================================================================

interface FundData {
  symbol: string;
  projectName: string;
  amc: string;
  nav: number;
  navDate: string;
  riskLevel: number;
  classification: string;
  category: string;
  ytdReturn: number;
  return3M: number;
  return6M: number;
  return1Y: number;
  return3Y: number;
  return5Y: number;
  frontEndFee: number;
  backEndFee: number;
  managementFee: number;
  totalExpenseRatio: number;
}

interface WidgetProps {
  data: FundData;
}

// ============================================================================
// Component: Risk Level Badge
// ============================================================================

function RiskLevelBadge({ level }: { level: number }) {
  const getRiskColor = (level: number) => {
    if (level <= 2) return 'bg-green-100 text-green-800';
    if (level <= 4) return 'bg-blue-100 text-blue-800';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (level: number) => {
    if (level <= 2) return 'Low Risk';
    if (level <= 4) return 'Moderate Risk';
    if (level <= 6) return 'Medium-High Risk';
    return 'High Risk';
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(level)}`}>
      Level {level} - {getRiskLabel(level)}
    </span>
  );
}

// ============================================================================
// Component: Performance Metric
// ============================================================================

interface PerformanceMetricProps {
  label: string;
  value: number | null;
  suffix?: string;
}

function PerformanceMetric({ label, value, suffix = '%' }: PerformanceMetricProps) {
  const getPerformanceColor = (value: number | null) => {
    if (value === null || value === 0) return 'text-gray-600';
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatValue = (value: number | null) => {
    if (value === null) return 'N/A';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}${suffix}`;
  };

  return (
    <div className="flex flex-col">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-lg font-semibold ${getPerformanceColor(value)}`}>
        {formatValue(value)}
      </span>
    </div>
  );
}

// ============================================================================
// Component: Info Row
// ============================================================================

interface InfoRowProps {
  label: string;
  value: string | number;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

// ============================================================================
// Main Widget Component
// ============================================================================

function RMFFundDetailWidget({ data }: WidgetProps) {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">{data.projectName}</h1>
        <div className="flex items-center gap-4">
          <span className="text-lg font-mono">{data.symbol}</span>
          <span className="text-sm opacity-90">{data.amc}</span>
        </div>
      </div>

      {/* NAV Section */}
      <div className="bg-blue-50 p-6 border-b border-blue-100">
        <div className="flex items-end gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Net Asset Value</div>
            <div className="text-4xl font-bold text-blue-900">
              {data.nav.toFixed(4)}
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            As of {new Date(data.navDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Fund Information */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Fund Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <InfoRow label="Classification" value={data.classification} />
            <InfoRow label="Category" value={data.category} />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Risk Level</span>
              <RiskLevelBadge level={data.riskLevel} />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <PerformanceMetric label="YTD" value={data.ytdReturn} />
          <PerformanceMetric label="3 Months" value={data.return3M} />
          <PerformanceMetric label="6 Months" value={data.return6M} />
          <PerformanceMetric label="1 Year" value={data.return1Y} />
          <PerformanceMetric label="3 Years" value={data.return3Y} />
          <PerformanceMetric label="5 Years" value={data.return5Y} />
        </div>
      </div>

      {/* Fees */}
      <div className="p-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Fees & Expenses</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <PerformanceMetric label="Front-end Fee" value={data.frontEndFee} />
          <PerformanceMetric label="Back-end Fee" value={data.backEndFee} />
          <PerformanceMetric label="Management Fee" value={data.managementFee} />
          <PerformanceMetric label="Total Expense Ratio" value={data.totalExpenseRatio} />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-100 text-center text-sm text-gray-600">
        Data provided by RMF Market Pulse MCP
      </div>
    </div>
  );
}

// ============================================================================
// Widget Initialization
// ============================================================================

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

// Parse widget data from window object (set by ChatGPT)
// @ts-ignore - ChatGPT injects this
const widgetData: FundData = window.__WIDGET_DATA__ || {
  symbol: 'SAMPLE',
  projectName: 'Sample RMF Fund',
  amc: 'Sample Asset Management',
  nav: 10.5000,
  navDate: new Date().toISOString(),
  riskLevel: 5,
  classification: 'Equity Fund',
  category: 'Domestic Equity',
  ytdReturn: 8.5,
  return3M: 3.2,
  return6M: 5.8,
  return1Y: 12.3,
  return3Y: 25.6,
  return5Y: 45.2,
  frontEndFee: 1.5,
  backEndFee: 0.5,
  managementFee: 1.25,
  totalExpenseRatio: 1.85
};

// Render the widget
createRoot(rootElement).render(
  <StrictMode>
    <RMFFundDetailWidget data={widgetData} />
  </StrictMode>
);

// Export for testing
export { RMFFundDetailWidget };
export type { FundData, WidgetProps };
