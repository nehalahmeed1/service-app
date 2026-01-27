import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStats = ({ stats }) => {
  const statItems = [
    {
      icon: 'Briefcase',
      label: 'Years Experience',
      value: stats?.yearsExperience,
      color: 'text-primary',
    },
    {
      icon: 'CheckCircle2',
      label: 'Completed Jobs',
      value: stats?.completedJobs,
      color: 'text-success',
    },
    {
      icon: 'Clock',
      label: 'Response Time',
      value: stats?.responseTime,
      color: 'text-accent',
    },
    {
      icon: 'Users',
      label: 'Repeat Customers',
      value: `${stats?.repeatCustomerRate}%`,
      color: 'text-secondary',
    },
  ];

  return (
    <div className="bg-card rounded-xl shadow-md p-4 md:p-6 lg:p-8">
      <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6">Quick Stats</h3>
      <div className="space-y-4 md:space-y-6">
        {statItems?.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-lg bg-muted ${item?.color}`}>
              <Icon name={item?.icon} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs md:text-sm text-muted-foreground">{item?.label}</div>
              <div className="text-lg md:text-xl font-bold text-foreground">{item?.value}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-3">Verification Badges</h4>
        <div className="space-y-2">
          {stats?.verificationBadges?.map((badge, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle2" size={16} color="var(--color-success)" />
              <span className="text-muted-foreground">{badge}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-3">Service Area</h4>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Icon name="MapPin" size={16} className="flex-shrink-0 mt-0.5" />
          <span>{stats?.serviceArea}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;