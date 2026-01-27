import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const BookingCard = ({ booking, userRole, onReschedule, onCancel, onComplete, onViewDetails }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-success/10 text-success border-success/20';
      case 'pending': return 'bg-warning/10 text-warning border-warning/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return 'CheckCircle2';
      case 'pending': return 'Clock';
      case 'completed': return 'Check';
      case 'cancelled': return 'XCircle';
      default: return 'Circle';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr?.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden hover:shadow-lg transition-all">
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
            <Image
              src={userRole === 'customer' ? booking?.providerImage : booking?.customerImage}
              alt={userRole === 'customer' ? booking?.providerImageAlt : booking?.customerImageAlt}
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-base md:text-lg font-semibold mb-1 truncate">
                {userRole === 'customer' ? booking?.providerName : booking?.customerName}
              </h4>
              <p className="text-sm text-muted-foreground mb-2">{booking?.serviceType}</p>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking?.status)}`}>
                <Icon name={getStatusIcon(booking?.status)} size={14} />
                <span className="capitalize">{booking?.status}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            iconName="MoreVertical"
            onClick={() => setShowActions(!showActions)}
            className="flex-shrink-0"
          />
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3 text-sm">
            <Icon name="Calendar" size={18} className="text-muted-foreground flex-shrink-0" />
            <span className="font-medium">{formatDate(booking?.date)}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Icon name="Clock" size={18} className="text-muted-foreground flex-shrink-0" />
            <span>{formatTime(booking?.time)} ({booking?.duration})</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <Icon name="MapPin" size={18} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{booking?.location}</span>
          </div>
        </div>

        {booking?.notes && (
          <div className="p-3 bg-muted rounded-lg mb-4">
            <p className="text-sm text-muted-foreground line-clamp-2">{booking?.notes}</p>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              iconName="Eye"
              iconPosition="left"
              onClick={() => onViewDetails(booking)}
              className="flex-1 min-w-[120px]"
            >
              Details
            </Button>
            {booking?.status === 'confirmed' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={() => onReschedule(booking)}
                  className="flex-1 min-w-[120px]"
                >
                  Reschedule
                </Button>
                {userRole === 'provider' && (
                  <Button
                    variant="success"
                    size="sm"
                    iconName="Check"
                    iconPosition="left"
                    onClick={() => onComplete(booking)}
                    className="flex-1 min-w-[120px]"
                  >
                    Complete
                  </Button>
                )}
              </>
            )}
            {(booking?.status === 'confirmed' || booking?.status === 'pending') && (
              <Button
                variant="destructive"
                size="sm"
                iconName="X"
                iconPosition="left"
                onClick={() => onCancel(booking)}
                className="flex-1 min-w-[120px]"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCard;