import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const EarningsChart = ({ data }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-1">{payload?.[0]?.payload?.month}</p>
          <p className="text-sm text-success">
            Earnings: <span className="font-semibold">${payload?.[0]?.value?.toLocaleString()}</span>
          </p>
          <p className="text-sm text-primary">
            Jobs: <span className="font-semibold">{payload?.[1]?.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64 md:h-80" aria-label="Monthly Earnings Bar Chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis 
            dataKey="month" 
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="var(--color-muted-foreground)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '12px' }}
            iconType="circle"
          />
          <Bar 
            dataKey="earnings" 
            fill="var(--color-success)" 
            radius={[8, 8, 0, 0]}
            name="Earnings ($)"
          />
          <Bar 
            dataKey="jobs" 
            fill="var(--color-primary)" 
            radius={[8, 8, 0, 0]}
            name="Jobs Completed"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EarningsChart;