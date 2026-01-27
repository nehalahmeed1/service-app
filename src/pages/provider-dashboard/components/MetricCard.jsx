import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricCard = ({ title, value, trend, trendValue, icon, iconBg, description }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="bg-card rounded-xl p-4 md:p-6 shadow-sm border border-border smooth-transition hover:shadow-md">
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${iconBg}`}>
          <Icon name={icon} size={24} />
        </div>
      </div>
      
      {trend && (
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md ${
            isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
          }`}>
            <Icon name={isPositive ? 'TrendingUp' : 'TrendingDown'} size={14} />
            <span className="text-xs font-medium">{trendValue}</span>
          </div>
          <span className="text-xs text-muted-foreground">{description}</span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;