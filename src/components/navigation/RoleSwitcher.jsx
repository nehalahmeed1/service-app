import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';

const RoleSwitcher = ({ isOpen, onClose, currentRole, onRoleChange }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  const roles = [
    {
      value: 'customer',
      label: 'Customer',
      description: 'Find and book home services',
      icon: 'User',
      features: ['Browse providers', 'Request services', 'Manage bookings', 'Leave reviews'],
    },
    {
      value: 'provider',
      label: 'Service Provider',
      description: 'Manage your service business',
      icon: 'Briefcase',
      features: ['View job requests', 'Manage schedule', 'Build reputation'],
    },
  ];

  const handleRoleSelect = (roleValue) => {
    setSelectedRole(roleValue);
  };

  const handleConfirm = () => {
    onRoleChange(selectedRole);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-background/95 animate-fade-in">
      <div className="w-full max-w-2xl mx-4 bg-card rounded-xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold">Switch Role</h3>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg smooth-transition">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground">
            Choose how you want to use ServiceConnect. You can switch between roles anytime.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {roles?.map((role) => (
              <button
                key={role?.value}
                onClick={() => handleRoleSelect(role?.value)}
                className={`p-6 rounded-xl border-2 text-left smooth-transition ${
                  selectedRole === role?.value
                    ? 'border-primary bg-primary/10' :'border-border hover:border-primary/50 hover:bg-muted'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${
                      selectedRole === role?.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon name={role?.icon} size={24} />
                    </div>
                    <div>
                      <div className="font-semibold text-lg">{role?.label}</div>
                      <div className="text-sm text-muted-foreground">{role?.description}</div>
                    </div>
                  </div>
                  {selectedRole === role?.value && (
                    <Icon name="CheckCircle2" size={24} color="var(--color-primary)" />
                  )}
                </div>

                <div className="space-y-2">
                  {role?.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Icon name="Check" size={16} color="var(--color-success)" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-border">
          <Button variant="outline" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button variant="default" fullWidth onClick={handleConfirm}>
            Switch to {roles?.find(r => r?.value === selectedRole)?.label}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RoleSwitcher;