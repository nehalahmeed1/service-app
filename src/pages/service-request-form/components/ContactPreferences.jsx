import React from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const ContactPreferences = ({ preferences, onPreferencesChange }) => {
  const contactMethods = [
    {
      id: 'phone',
      label: 'Phone Call',
      description: 'Receive calls from providers',
      icon: 'Phone',
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'sms',
      label: 'Text Message',
      description: 'Get SMS notifications',
      icon: 'MessageSquare',
      color: 'text-green-600 dark:text-green-400'
    },
    {
      id: 'email',
      label: 'Email',
      description: 'Receive email updates',
      icon: 'Mail',
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      id: 'app',
      label: 'In-App Messages',
      description: 'Chat through the platform',
      icon: 'MessageCircle',
      color: 'text-orange-600 dark:text-orange-400'
    }
  ];

  const handleMethodToggle = (methodId) => {
    const updated = preferences?.includes(methodId)
      ? preferences?.filter(id => id !== methodId)
      : [...preferences, methodId];
    onPreferencesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Contact Preferences <span className="text-error">*</span>
        </label>
        <p className="text-xs text-muted-foreground">
          How would you like providers to contact you?
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {contactMethods?.map((method) => (
          <div
            key={method?.id}
            className={`p-4 rounded-lg border smooth-transition ${
              preferences?.includes(method?.id)
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
            }`}
          >
            <Checkbox
              checked={preferences?.includes(method?.id)}
              onChange={() => handleMethodToggle(method?.id)}
              label={
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon name={method?.icon} size={20} className={method?.color} />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{method?.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {method?.description}
                    </div>
                  </div>
                </div>
              }
            />
          </div>
        ))}
      </div>
      {preferences?.length === 0 && (
        <div className="flex items-center gap-2 text-sm text-error p-3 bg-error/10 rounded-lg">
          <Icon name="AlertCircle" size={16} />
          <span>Please select at least one contact method</span>
        </div>
      )}
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex gap-3">
          <Icon name="Lock" size={20} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-sm mb-1">Privacy Notice</h4>
            <p className="text-xs text-muted-foreground">
              Your contact information will only be shared with providers who respond to your request. We never sell your data to third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPreferences;