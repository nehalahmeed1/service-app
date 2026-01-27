import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole] = useState('customer');
  const [pendingRequests] = useState(3);

  const navigationItems = [
    {
      label: 'Search',
      path: '/service-provider-search',
      icon: 'Search',
      roleAccess: ['customer', 'provider'],
    },
    {
      label: 'Request',
      path: '/service-request-form',
      icon: 'FileText',
      roleAccess: ['customer'],
    },
    {
      label: 'Bookings',
      path: '/booking-management',
      icon: 'Calendar',
      roleAccess: ['customer', 'provider'],
      badge: pendingRequests,
    },
    {
      label: 'Hub',
      path: '/provider-dashboard',
      icon: 'Briefcase',
      roleAccess: ['provider'],
    },
    {
      label: 'Reviews',
      path: '/reviews-and-ratings',
      icon: 'Star',
      roleAccess: ['customer', 'provider'],
    },
  ];

  const filteredNavItems = navigationItems?.filter(item =>
    item?.roleAccess?.includes(userRole)
  )?.slice(0, 5);

  const isActive = (path) => location?.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {filteredNavItems?.map((item) => (
          <button
            key={item?.path}
            onClick={() => handleNavigation(item?.path)}
            className={`bottom-nav-item ${isActive(item?.path) ? 'active' : ''}`}
          >
            <div className="relative">
              <Icon name={item?.icon} size={22} />
              {item?.badge && item?.badge > 0 && (
                <span className="nav-tab-badge">{item?.badge}</span>
              )}
            </div>
            <span className="bottom-nav-label">{item?.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;