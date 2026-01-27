import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Select from '../../../components/ui/Select';

const ReviewsTab = ({ reviews, overallRating, ratingDistribution }) => {
  const [sortBy, setSortBy] = useState('recent');
  const [filterRating, setFilterRating] = useState('all');

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'helpful', label: 'Most Helpful' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
  ];

  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' },
  ];

  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews?.filter(review => review?.rating === parseInt(filterRating));

  const sortedReviews = [...filteredReviews]?.sort((a, b) => {
    switch (sortBy) {
      case 'helpful':
        return b?.helpfulCount - a?.helpfulCount;
      case 'highest':
        return b?.rating - a?.rating;
      case 'lowest':
        return a?.rating - b?.rating;
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name={index < rating ? 'Star' : 'Star'}
        size={16}
        color={index < rating ? 'var(--color-accent)' : 'var(--color-muted)'}
      />
    ));
  };

  return (
    <div>
      <div className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-shrink-0 text-center lg:text-left">
            <div className="text-5xl md:text-6xl font-bold text-primary mb-2">
              {overallRating}
            </div>
            <div className="flex justify-center lg:justify-start gap-1 mb-2">
              {renderStars(Math.round(overallRating))}
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {reviews?.length} reviews
            </div>
          </div>

          <div className="flex-1 space-y-2">
            {ratingDistribution?.map((dist) => (
              <div key={dist?.stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16 text-sm">
                  <span>{dist?.stars}</span>
                  <Icon name="Star" size={14} color="var(--color-accent)" />
                </div>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent smooth-transition"
                    style={{ width: `${dist?.percentage}%` }}
                  ></div>
                </div>
                <div className="w-12 text-sm text-muted-foreground text-right">
                  {dist?.percentage}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={setSortBy}
          placeholder="Sort by"
          className="flex-1"
        />
        <Select
          options={ratingOptions}
          value={filterRating}
          onChange={setFilterRating}
          placeholder="Filter by rating"
          className="flex-1"
        />
      </div>
      <div className="space-y-4 md:space-y-6">
        {sortedReviews?.map((review) => (
          <div
            key={review?.id}
            className="bg-card rounded-xl shadow-sm border border-border p-4 md:p-6"
          >
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden bg-muted">
                  <Image
                    src={review?.customerImage}
                    alt={review?.customerImageAlt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-semibold text-foreground">{review?.customerName}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{review?.date}</span>
                      <span>•</span>
                      <span>{review?.serviceType}</span>
                    </div>
                  </div>
                  <div className="flex gap-1">{renderStars(review?.rating)}</div>
                </div>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
                  {review?.comment}
                </p>
                {review?.images && review?.images?.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {review?.images?.map((img, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted"
                      >
                        <Image
                          src={img?.src}
                          alt={img?.alt}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground smooth-transition">
                    <Icon name="ThumbsUp" size={16} />
                    <span>Helpful ({review?.helpfulCount})</span>
                  </button>
                  {review?.providerResponse && (
                    <span className="text-success">Provider Responded</span>
                  )}
                </div>
                {review?.providerResponse && (
                  <div className="mt-4 pl-4 border-l-2 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="MessageCircle" size={16} color="var(--color-primary)" />
                      <span className="text-sm font-medium text-primary">Provider Response</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review?.providerResponse}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsTab;