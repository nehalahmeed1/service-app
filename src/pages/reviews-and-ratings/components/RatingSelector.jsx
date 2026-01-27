import React from 'react';
import Icon from '../../../components/AppIcon';

const RatingSelector = ({ 
  label, 
  value, 
  onChange, 
  description,
  size = 'default' 
}) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeClasses = {
    small: 'w-6 h-6',
    default: 'w-8 h-8 md:w-10 md:h-10',
    large: 'w-10 h-10 md:w-12 md:h-12'
  };

  const handleStarClick = (rating) => {
    onChange(rating);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm md:text-base font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        {stars?.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            className={`${sizeClasses?.[size]} flex items-center justify-center rounded-lg smooth-transition hover:scale-110 active:scale-95`}
          >
            <Icon
              name={star <= value ? 'Star' : 'Star'}
              size={size === 'small' ? 20 : size === 'large' ? 28 : 24}
              color={star <= value ? '#FF6B35' : '#CBD5E0'}
              className={star <= value ? 'fill-current' : ''}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="ml-2 text-sm md:text-base font-medium text-foreground">
            {value}.0
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs md:text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

export default RatingSelector;