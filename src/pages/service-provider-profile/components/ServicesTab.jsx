import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';


const ServicesTab = ({ services, onRequestService }) => {
  return (
    <div className="space-y-4 md:space-y-6">
      {services?.map((service) => (
        <div
          key={service?.id}
          className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6 hover:shadow-md smooth-transition"
        >
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex-shrink-0">
              <div className="w-full lg:w-32 h-32 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={service?.image}
                  alt={service?.imageAlt}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                    {service?.name}
                  </h4>
                  <p className="text-sm md:text-base text-muted-foreground line-clamp-2">
                    {service?.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {service?.features?.map((feature, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs md:text-sm text-muted-foreground">
                    <Icon name="Check" size={14} color="var(--color-success)" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Icon name="Clock" size={16} />
                  <span className="text-muted-foreground">{service?.duration}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Icon name="Star" size={16} color="var(--color-accent)" />
                  <span className="font-medium">{service?.rating}</span>
                  <span className="text-muted-foreground">({service?.bookings} bookings)</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => onRequestService(service?.id)}
                  className="ml-auto"
                >
                  Request Service
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ServicesTab;