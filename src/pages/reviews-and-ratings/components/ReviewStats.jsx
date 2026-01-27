import React from 'react';
import Icon from '../../../components/AppIcon';

const ReviewStats = ({ stats }) => {
  const statCards = [
    {
      label: 'Total Reviews',
      value: stats?.totalReviews?.toLocaleString(),
      icon: 'MessageSquare',
      color: 'primary',
      trend: stats?.reviewTrend
    },
    {
      label: 'Average Rating',
      value: stats?.averageRating?.toFixed(1),
      icon: 'Star',
      color: 'accent',
      suffix: '/ 5.0'
    },
    {
      label: 'Response Rate',
      value: `${stats?.responseRate}%`,
      icon: 'MessageCircle',
      color: 'secondary',
      trend: stats?.responseTrend
    },
    {
      label: 'Satisfaction',
      value: `${stats?.satisfactionRate}%`,
      icon: 'ThumbsUp',
      color: 'success',
      trend: stats?.satisfactionTrend
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      primary: 'bg-primary/10 text-primary',
      accent: 'bg-accent/10 text-accent',
      secondary: 'bg-secondary/10 text-secondary',
      success: 'bg-success/10 text-success'
    };
    return colors?.[color] || colors?.primary;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className="bg-card rounded-xl p-4 md:p-6 border border-border space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg ${getColorClasses(stat?.color)} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={20} />
            </div>
            {stat?.trend && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
                stat?.trend > 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
              }`}>
                <Icon
                  name={stat?.trend > 0 ? 'TrendingUp' : 'TrendingDown'}
                  size={14}
                />
                <span className="text-xs font-medium">
                  {Math.abs(stat?.trend)}%
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-foreground">
                {stat?.value}
              </span>
              {stat?.suffix && (
                <span className="text-sm text-muted-foreground">
                  {stat?.suffix}
                </span>
              )}
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              {stat?.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewStats;