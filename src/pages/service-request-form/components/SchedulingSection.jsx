import React from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const SchedulingSection = ({ 
  preferredDate, 
  preferredTime, 
  isFlexible, 
  onDateChange, 
  onTimeChange, 
  onFlexibleChange,
  errors 
}) => {
  const timeSlots = [
    { value: 'morning', label: 'Morning (8AM - 12PM)', icon: 'Sunrise' },
    { value: 'afternoon', label: 'Afternoon (12PM - 5PM)', icon: 'Sun' },
    { value: 'evening', label: 'Evening (5PM - 8PM)', icon: 'Sunset' }
  ];

  const today = new Date()?.toISOString()?.split('T')?.[0];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Preferred Schedule <span className="text-error">*</span>
        </label>
        <p className="text-xs text-muted-foreground mb-4">
          Select your preferred date and time for the service
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          type="date"
          label="Preferred Date"
          value={preferredDate}
          onChange={(e) => onDateChange(e?.target?.value)}
          min={today}
          error={errors?.date}
          required
        />

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Time Preference
          </label>
          <div className="space-y-2">
            {timeSlots?.map((slot) => (
              <button
                key={slot?.value}
                type="button"
                onClick={() => onTimeChange(slot?.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border smooth-transition ${
                  preferredTime === slot?.value
                    ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <Icon name={slot?.icon} size={20} />
                <span className="text-sm flex-1 text-left">{slot?.label}</span>
                {preferredTime === slot?.value && (
                  <Icon name="Check" size={18} color="var(--color-primary)" />
                )}
              </button>
            ))}
          </div>
          {errors?.time && (
            <div className="flex items-center gap-2 text-sm text-error mt-2">
              <Icon name="AlertCircle" size={16} />
              <span>{errors?.time}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 bg-muted rounded-lg">
        <Checkbox
          label="I'm flexible with the schedule"
          description="Provider can suggest alternative times if needed"
          checked={isFlexible}
          onChange={(e) => onFlexibleChange(e?.target?.checked)}
        />
      </div>
    </div>
  );
};

export default SchedulingSection;