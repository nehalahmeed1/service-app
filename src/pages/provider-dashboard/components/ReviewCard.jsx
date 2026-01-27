import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ReviewCard = ({ review }) => {
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="Star"
        size={16}
        className={index < rating ? 'fill-warning text-warning' : 'text-muted'}
      />
    ));
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const reviewDate = new Date(date);
    const diffInDays = Math.floor((now - reviewDate) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-5 border border-border">
      <div className="flex items-start gap-3 mb-3">
        <Image
          src={review?.customerImage}
          alt={review?.customerImageAlt}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h5 className="font-semibold text-sm md:text-base text-foreground">{review?.customerName}</h5>
              <p className="text-xs text-muted-foreground">{review?.serviceType}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{getTimeAgo(review?.date)}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {renderStars(review?.rating)}
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-3">{review?.comment}</p>
    </div>
  );
};

export default ReviewCard;