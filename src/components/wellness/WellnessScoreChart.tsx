import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { WeeklyWellnessScore } from '../../types';
import { useWellnessApi } from '../../services/wellness-api';

interface WellnessScoreChartProps {
  data: WeeklyWellnessScore[];
  onWeekClick?: (weekStart: string) => void;
  className?: string;
}

interface ChartDataPoint {
  weekStart: string;
  score: number;
  weekLabel: string;
  isCurrentWeek: boolean;
}

const WellnessScoreChart: React.FC<WellnessScoreChartProps> = ({
  data,
  onWeekClick,
  className = '',
}) => {
  const { getWeekStart } = useWellnessApi();
  
  // Get current week for highlighting (using timezone-aware function)
  const currentWeek = getWeekStart(new Date());

  // Transform data for chart
  const chartData: ChartDataPoint[] = data
    .filter(score => score.score > 0) // Only include weeks with actual data
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
    .map((score) => {
      // Calculate the proper Monday for this week instead of using the stored weekStart
      // This ensures we always show Monday dates even if the database has incorrect dates
      const weekStartDate = new Date(score.weekStart + 'T12:00:00');
      const properMonday = getWeekStart(weekStartDate);
      const mondayDate = new Date(properMonday + 'T12:00:00');
      
      const month = mondayDate.toLocaleDateString('en-US', { month: 'short' });
      const day = mondayDate.getDate();
      
      return {
        weekStart: properMonday, // Use the proper Monday date
        score: Math.round(score.score * 10) / 10, // Round to 1 decimal
        weekLabel: `${month} ${day}`, // This will always be a Monday
        isCurrentWeek: properMonday === currentWeek,
      };
    });

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const weekEnd = new Date(data.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      return (
        <div className="wellness-chart-tooltip">
          <p className="wellness-tooltip-title">
            {`Week of ${data.weekLabel} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
          </p>
          <p className="wellness-tooltip-score">
            <span className="wellness-tooltip-label">Score: </span>
            <span className="wellness-tooltip-value">{data.score}/100</span>
          </p>
          {data.isCurrentWeek && (
            <p className="wellness-tooltip-current">Current Week</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Handle point click
  const handlePointClick = (data: ChartDataPoint) => {
    if (onWeekClick) {
      onWeekClick(data.weekStart);
    }
  };

  if (chartData.length === 0) {
    return (
      <div className={`wellness-chart-empty ${className}`}>
        <div className="wellness-chart-empty-content">
          <span className="wellness-chart-empty-icon">📊</span>
          <p className="wellness-chart-empty-title">No wellness data yet</p>
          <p className="wellness-chart-empty-subtitle">
            Start tracking your wellness practices to see your progress over time.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`wellness-chart-container ${className}`}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="weekLabel"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            domain={[0, 100]}
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#10a37f"
            strokeWidth={3}
            dot={(props: any) => {
              const isCurrentWeek = props.payload?.isCurrentWeek;
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={isCurrentWeek ? 6 : 4}
                  fill={isCurrentWeek ? '#059669' : '#10a37f'}
                  stroke="#ffffff"
                  strokeWidth={2}
                  className={onWeekClick ? 'cursor-pointer hover:r-6' : ''}
                  onClick={() => onWeekClick && handlePointClick(props.payload)}
                />
              );
            }}
            activeDot={{ r: 6, fill: '#059669' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WellnessScoreChart; 