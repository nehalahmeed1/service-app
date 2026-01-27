import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const QuickActionMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [userRole] = useState('customer');
  const menuRef = useRef(null);

  const quickActions = [
    {
      label: 'Emergency Service',
      icon: 'AlertCircle',
      action: () => navigate('/service-request-form?urgent=true'),
      roleAccess: ['customer'],
      urgent: true,
    },
    {
      label: 'Contact Provider',
      icon: 'MessageCircle',
      action: () => console.log('Contact provider'),
      roleAccess: ['customer'],
    },
    {
      label: 'View Active Jobs',
      icon: 'Briefcase',
      action: () => navigate('/provider-dashboard'),
      roleAccess: ['provider'],
    },
    {
      label: 'Quick Quote',
      icon: 'DollarSign',
      action: () => console.log('Quick quote'),
      roleAccess: ['provider'],
    },
    {
      label: 'Schedule Booking',
      icon: 'Calendar',
      action: () => navigate('/booking-management'),
      roleAccess: ['customer', 'provider'],
    },
  ];

  const filteredActions = quickActions?.filter(action =>
    action?.roleAccess?.includes(userRole)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef?.current && !menuRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (action) => {
    action?.action();
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        className="quick-action-fab"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon name={isOpen ? 'X' : 'Zap'} size={24} />
      </button>
      {isOpen && (
        <div className="quick-action-menu">
          {filteredActions?.map((action, index) => (
            <button
              key={index}
              onClick={() => handleActionClick(action)}
              className={`quick-action-item ${action?.urgent ? 'urgent' : ''}`}
            >
              <Icon name={action?.icon} size={20} />
              <span className="flex-1 text-left">{action?.label}</span>
              {action?.urgent && (
                <Icon name="ChevronRight" size={16} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuickActionMenu;