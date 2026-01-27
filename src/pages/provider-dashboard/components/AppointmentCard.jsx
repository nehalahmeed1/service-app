import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const AppointmentCard = ({ appointment, onNavigate, onContact, onComplete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'in-progress':
        return 'bg-primary/10 text-primary border-primary/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border smooth-transition hover:shadow-md">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Image
            src={appointment?.customerImage}
            alt={appointment?.customerImageAlt}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-base md:text-lg text-foreground">{appointment?.customerName}</h4>
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                  <Icon name="Star" size={14} className="fill-warning text-warning" />
                  <span>{appointment?.customerRating}</span>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(appointment?.status)}`}>
                {appointment?.status?.charAt(0)?.toUpperCase() + appointment?.status?.slice(1)?.replace('-', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Wrench" size={16} className="text-primary" />
                <span className="font-medium">{appointment?.serviceType}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-sm font-medium">{appointment?.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-medium">{appointment?.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium line-clamp-1">{appointment?.location}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:flex-col gap-2 md:min-w-[140px]">
          <Button
            variant="default"
            size="sm"
            fullWidth
            iconName="Navigation"
            iconPosition="left"
            onClick={() => onNavigate(appointment?.id)}
          >
            Navigate
          </Button>
          <Button
            variant="outline"
            size="sm"
            fullWidth
            iconName="Phone"
            iconPosition="left"
            onClick={() => onContact(appointment?.id)}
          >
            Contact
          </Button>
          {appointment?.status === 'in-progress' && (
            <Button
              variant="success"
              size="sm"
              fullWidth
              iconName="CheckCircle2"
              iconPosition="left"
              onClick={() => onComplete(appointment?.id)}
            >
              Complete
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;