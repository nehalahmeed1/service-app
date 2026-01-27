import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ReviewCard = ({ review, onReport, onHelpful, userRole }) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [responseText, setResponseText] = useState('');

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5]?.map((star) => (
          <Icon
            key={star}
            name="Star"
            size={16}
            color={star <= rating ? '#FF6B35' : '#CBD5E0'}
            className={star <= rating ? 'fill-current' : ''}
          />
        ))}
      </div>
    );
  };

  const handleSubmitResponse = () => {
    console.log('Response submitted:', responseText);
    setShowResponse(false);
    setResponseText('');
  };

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border space-y-4">
      <div className="flex items-start gap-3 md:gap-4">
        <Image
          src={review?.customerAvatar}
          alt={review?.customerAvatarAlt}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm md:text-base font-semibold text-foreground truncate">
                {review?.customerName}
              </h4>
              <p className="text-xs md:text-sm text-muted-foreground">
                {review?.date} • {review?.serviceType}
              </p>
            </div>
            {review?.verified && (
              <div className="flex items-center gap-1 px-2 py-1 bg-success/10 rounded-lg flex-shrink-0">
                <Icon name="CheckCircle2" size={14} color="var(--color-success)" />
                <span className="text-xs font-medium text-success">Verified</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Overall</p>
                {renderStars(review?.ratings?.overall)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Quality</p>
                {renderStars(review?.ratings?.quality)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Punctuality</p>
                {renderStars(review?.ratings?.punctuality)}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                {renderStars(review?.ratings?.value)}
              </div>
            </div>

            <div>
              <p className={`text-sm md:text-base text-foreground ${!showFullReview && review?.comment?.length > 200 ? 'line-clamp-3' : ''}`}>
                {review?.comment}
              </p>
              {review?.comment?.length > 200 && (
                <button
                  onClick={() => setShowFullReview(!showFullReview)}
                  className="text-sm text-primary font-medium mt-2 hover:underline"
                >
                  {showFullReview ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>

            {review?.photos && review?.photos?.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {review?.photos?.map((photo, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={photo?.url}
                      alt={photo?.alt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {review?.providerResponse && (
              <div className="bg-muted rounded-lg p-3 md:p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="MessageCircle" size={16} color="var(--color-secondary)" />
                  <span className="text-xs md:text-sm font-medium text-secondary">
                    Provider Response
                  </span>
                </div>
                <p className="text-sm text-foreground">{review?.providerResponse}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => onHelpful(review?.id)}
                  className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-primary smooth-transition"
                >
                  <Icon name="ThumbsUp" size={16} />
                  <span>Helpful ({review?.helpfulCount})</span>
                </button>
                <button
                  onClick={() => onReport(review?.id)}
                  className="flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground hover:text-error smooth-transition"
                >
                  <Icon name="Flag" size={16} />
                  <span>Report</span>
                </button>
              </div>

              {userRole === 'provider' && !review?.providerResponse && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="MessageCircle"
                  iconPosition="left"
                  onClick={() => setShowResponse(!showResponse)}
                >
                  Respond
                </Button>
              )}
            </div>

            {showResponse && (
              <div className="space-y-3 pt-3 border-t border-border">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e?.target?.value)}
                  placeholder="Write a professional response to this review..."
                  className="w-full min-h-24 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {responseText?.length}/500
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowResponse(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmitResponse}
                      disabled={responseText?.trim()?.length < 10}
                    >
                      Submit Response
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;