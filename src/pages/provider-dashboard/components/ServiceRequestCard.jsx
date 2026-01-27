import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ServiceRequestCard = ({ request, onAccept, onDecline, onViewDetails }) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return 'bg-error/10 text-error border-error/20';
      case 'high':
        return 'bg-warning/10 text-warning border-warning/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border smooth-transition hover:shadow-md">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Image
            src={request?.customerImage}
            alt={request?.customerImageAlt}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-base md:text-lg text-foreground">{request?.customerName}</h4>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                  <Icon name="MapPin" size={14} />
                  <span>{request?.location}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getUrgencyColor(request?.urgency)}`}>
                {request?.urgency === 'urgent' ? 'Urgent' : request?.urgency === 'high' ? 'High Priority' : 'Standard'}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Wrench" size={16} className="text-primary" />
                <span className="font-medium">{request?.serviceType}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{request?.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Preferred Date</p>
                  <p className="text-sm font-medium">{request?.preferredDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">{request?.preferredTime}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="DollarSign" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="text-sm font-medium">{request?.budget}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex lg:flex-col gap-2 lg:min-w-[140px]">
          <Button
            variant="default"
            size="sm"
            fullWidth
            iconName="Check"
            iconPosition="left"
            onClick={() => onAccept(request?.id)}
          >
            Accept
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="MessageSquare"
            iconPosition="left"
            onClick={() => onViewDetails(request?.id)}
          >
            Send Quote
          </Button>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            iconName="X"
            iconPosition="left"
            onClick={() => onDecline(request?.id)}
          >
            Decline
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestCard;