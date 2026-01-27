import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileHero = ({ provider, onRequestQuote, onMessage, onBookService }) => {
  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden">
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary/20 to-secondary/20">
        <Image
          src={provider?.coverImage}
          alt={provider?.coverImageAlt}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {provider?.isVerified && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-success text-success-foreground rounded-full text-xs font-medium">
              <Icon name="CheckCircle2" size={14} />
              <span>Verified</span>
            </div>
          )}
          {provider?.isTopRated && (
            <div className="flex items-center gap-1 px-3 py-1.5 bg-accent text-accent-foreground rounded-full text-xs font-medium">
              <Icon name="Award" size={14} />
              <span>Top Rated</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 md:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 -mt-16 md:-mt-20 lg:-mt-24 border-4 border-card rounded-xl overflow-hidden shadow-lg">
              <Image
                src={provider?.profileImage}
                alt={provider?.profileImageAlt}
                className="w-full h-full object-cover"
              />
              {provider?.isOnline && (
                <div className="absolute bottom-2 right-2 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {provider?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <div className="flex items-center gap-1">
                    <Icon name="Star" size={18} color="var(--color-accent)" />
                    <span className="font-semibold text-lg">{provider?.rating}</span>
                    <span className="text-muted-foreground text-sm">
                      ({provider?.reviewCount} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Icon name="MapPin" size={16} />
                    <span>{provider?.location}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {provider?.serviceCategories?.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3">
                <Button
                  variant="default"
                  size="lg"
                  iconName="FileText"
                  iconPosition="left"
                  onClick={onRequestQuote}
                  fullWidth
                >
                  Request Quote
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  iconName="MessageCircle"
                  iconPosition="left"
                  onClick={onMessage}
                  fullWidth
                >
                  Message
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  iconName="Calendar"
                  iconPosition="left"
                  onClick={onBookService}
                  fullWidth
                >
                  Book Service
                </Button>
              </div>
            </div>

            <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
              {provider?.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHero;