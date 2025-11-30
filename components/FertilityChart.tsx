import React, { useMemo } from 'react';
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
import { ViewMode, ChartDataPoint } from '../types';

// Deep, rich palette for the blue theme
const COLORS = [
  '#1e40af', // blue-800
  '#0ea5e9', // sky-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#f97316', // orange-500
];

interface FertilityChartProps {
  data: ChartDataPoint[];
  viewMode: ViewMode;
  selectedKeys: number[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string | number;
  viewMode: ViewMode;
}

const CustomTooltip = ({ active, payload, label, viewMode }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    let labelText = '';
    if (viewMode === ViewMode.BY_AGE) labelText = `Age: ${label}`;
    else if (viewMode === ViewMode.BY_YEAR) labelText = `Year: ${label}`;
    else if (viewMode === ViewMode.BY_BIRTH_YEAR) labelText = `Year: ${label}`;
    else if (viewMode === ViewMode.BY_BIRTH_YEAR_AGE) labelText = `Age: ${label}`;

    const isBirthYearMode = viewMode === ViewMode.BY_BIRTH_YEAR || viewMode === ViewMode.BY_BIRTH_YEAR_AGE;

    return (
      <div className="bg-white/95 backdrop-blur border border-blue-100 p-3 rounded shadow-lg text-sm z-50">
        <p className="font-bold text-blue-900 mb-2 border-b border-blue-100 pb-1">
          {labelText}
        </p>
        <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3 min-w-[140px]">
              <span className="font-semibold" style={{ color: entry.color }}>
                 {isBirthYearMode ? 'Born ' : ''}{entry.name}:
              </span>
              <span className="font-mono text-slate-700">{Number(entry.value).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const FertilityChart: React.FC<FertilityChartProps> = ({ data, viewMode, selectedKeys }) => {
  const sortedKeys = useMemo(() => [...selectedKeys].sort((a, b) => a - b), [selectedKeys]);

  let xLabel = 'Age';
  let xAxisKey = 'age';
  let subtitle = 'By Age (Cohorts over Time)';

  if (viewMode === ViewMode.BY_YEAR) {
    xLabel = 'Year';
    xAxisKey = 'year';
    subtitle = 'By Year (Historical Trends)';
  } else if (viewMode === ViewMode.BY_BIRTH_YEAR) {
    xLabel = 'Year';
    xAxisKey = 'year';
    subtitle = 'By Birth Year (Cohort History)';
  } else if (viewMode === ViewMode.BY_BIRTH_YEAR_AGE) {
    xLabel = 'Age';
    xAxisKey = 'age';
    subtitle = 'By Birth Year (Cohorts by Age)';
  }

  return (
    <div className="w-full h-full flex flex-col gap-3">
      <div className="w-full flex-1 p-6 bg-white rounded-2xl shadow-xl border border-blue-100 flex flex-col relative overflow-hidden min-h-0">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
         <div className="mb-4 flex justify-between items-end shrink-0">
           <div>
              <h2 className="text-3xl font-bold text-blue-900 tracking-tight">
                  Completed Fertility
              </h2>
              <p className="text-sm font-medium text-blue-400 uppercase tracking-wider mt-1">
                  {subtitle}
              </p>
           </div>
         </div>
        
        <div className="flex-1 min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 20,
                right: 20,
                left: 10,
                bottom: 25,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis 
                dataKey={xAxisKey} 
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fontSize: 13, fill: '#64748b' }}
                tickLine={false}
                minTickGap={40}
                axisLine={{ stroke: '#cbd5e1' }}
                label={{ 
                  value: xLabel, 
                  position: 'insideBottom', 
                  offset: -15, 
                  fill: '#94a3b8', 
                  fontSize: 15,
                  fontWeight: 600 
                }}
              />
              <YAxis 
                label={{ 
                  value: 'Completed Fertility', 
                  angle: -90, 
                  position: 'insideLeft', 
                  fill: '#94a3b8', 
                  fontSize: 15,
                  fontWeight: 600,
                  offset: 10
                }}
                tick={{ fontSize: 13, fill: '#64748b' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                 content={<CustomTooltip viewMode={viewMode} />} 
                 cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Legend 
                layout="vertical" 
                verticalAlign="middle" 
                align="right"
                wrapperStyle={{
                  paddingLeft: '20px',
                  fontSize: '13px',
                  color: '#475569'
                }}
                iconType="circle"
                iconSize={10}
              />
              
              {sortedKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={`${key}`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                  connectNulls
                  animationDuration={300}
                  strokeOpacity={0.9}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="px-2 text-[11px] text-slate-400 text-right font-medium italic shrink-0">
        Source: CPS Fertility Supplement via IPUMS, Calculations from Mike Konczal.
      </div>
    </div>
  );
};

export default FertilityChart;