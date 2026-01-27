import React from 'react';
import Icon from '../../../components/AppIcon';

const UrgencySelector = ({ urgency, onUrgencyChange }) => {
  const urgencyLevels = [
    {
      value: 'low',
      label: 'Standard',
      description: 'Within 1-2 weeks',
      icon: 'Clock',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
    {
      value: 'medium',
      label: 'Priority',
      description: 'Within 2-3 days',
      icon: 'Zap',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    {
      value: 'high',
      label: 'Urgent',
      description: 'Within 24 hours',
      icon: 'AlertCircle',
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    {
      value: 'emergency',
      label: 'Emergency',
      description: 'Immediate response',
      icon: 'Siren',
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-600/20',
      borderColor: 'border-red-600/50'
    }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Urgency Level <span className="text-error">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          How quickly do you need this service?
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {urgencyLevels?.map((level) => (
          <button
            key={level?.value}
            type="button"
            onClick={() => onUrgencyChange(level?.value)}
            className={`p-4 rounded-xl border-2 smooth-transition text-left ${
              urgency === level?.value
                ? `${level?.borderColor} ${level?.bgColor}`
                : 'border-border hover:border-primary/50 hover:bg-muted'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${level?.bgColor}`}>
                <Icon name={level?.icon} size={20} className={level?.color} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{level?.label}</span>
                  {urgency === level?.value && (
                    <Icon name="CheckCircle2" size={18} color="var(--color-primary)" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{level?.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {urgency === 'emergency' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex gap-3">
            <Icon name="AlertTriangle" size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400 mb-1">
                Emergency Service Notice
              </h4>
              <p className="text-sm text-red-600/80 dark:text-red-400/80">
                Emergency requests may incur additional fees. A provider will contact you immediately to assess the situation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UrgencySelector;