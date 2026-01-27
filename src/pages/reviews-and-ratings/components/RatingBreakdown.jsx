import React from 'react';
import Icon from '../../../components/AppIcon';

const RatingBreakdown = ({ ratings }) => {
  const totalReviews = ratings?.breakdown?.reduce((sum, item) => sum + item?.count, 0);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5]?.map((star) => (
          <Icon
            key={star}
            name="Star"
            size={20}
            color={star <= rating ? '#FF6B35' : '#CBD5E0'}
            className={star <= rating ? 'fill-current' : ''}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border">
      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4 md:mb-6">
        Rating Overview
      </h3>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 mb-6">
        <div className="text-center">
          <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {ratings?.average?.toFixed(1)}
          </div>
          {renderStars(Math.round(ratings?.average))}
          <p className="text-sm text-muted-foreground mt-2">
            {totalReviews?.toLocaleString()} reviews
          </p>
        </div>

        <div className="flex-1 w-full space-y-2">
          {ratings?.breakdown?.map((item) => {
            const percentage = totalReviews > 0 ? (item?.count / totalReviews) * 100 : 0;
            return (
              <div key={item?.stars} className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground w-8">
                  {item?.stars}★
                </span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent rounded-full smooth-transition"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {item?.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ratings?.categories?.map((category) => (
          <div key={category?.name} className="text-center p-3 bg-muted rounded-lg">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">
              {category?.name}
            </p>
            <div className="flex items-center justify-center gap-1 mb-1">
              <Icon
                name="Star"
                size={16}
                color="#FF6B35"
                className="fill-current"
              />
              <span className="text-base md:text-lg font-semibold text-foreground">
                {category?.rating?.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingBreakdown;