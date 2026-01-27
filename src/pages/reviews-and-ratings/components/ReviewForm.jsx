import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

import RatingSelector from './RatingSelector';
import PhotoUpload from './PhotoUpload';

const ReviewForm = ({ booking, onSubmit, onCancel }) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    quality: 0,
    punctuality: 0,
    value: 0
  });
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const suggestedTopics = [
    'Quality of work',
    'Professionalism',
    'Communication',
    'Timeliness',
    'Value for money',
    'Would recommend'
  ];

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    if (ratings?.overall === 0) {
      alert('Please provide an overall rating');
      return;
    }

    if (comment?.trim()?.length < 20) {
      alert('Please write at least 20 characters in your review');
      return;
    }

    setIsSubmitting(true);
    
    setTimeout(() => {
      onSubmit({
        bookingId: booking?.id,
        ratings,
        comment,
        photos: photos?.map(p => p?.preview)
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const isFormValid = ratings?.overall > 0 && comment?.trim()?.length >= 20;

  return (
    <div className="bg-card rounded-xl p-4 md:p-6 border border-border space-y-6">
      <div className="flex items-start gap-3 md:gap-4 pb-4 border-b border-border">
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon name="Star" size={24} color="var(--color-primary)" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Write a Review
          </h3>
          <p className="text-sm text-muted-foreground">
            Service: {booking?.serviceType} • Provider: {booking?.providerName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Completed on {booking?.completionDate}
          </p>
        </div>
      </div>
      <div className="space-y-6">
        <RatingSelector
          label="Overall Rating *"
          value={ratings?.overall}
          onChange={(value) => handleRatingChange('overall', value)}
          description="How would you rate your overall experience?"
          size="large"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <RatingSelector
            label="Quality of Work"
            value={ratings?.quality}
            onChange={(value) => handleRatingChange('quality', value)}
          />
          <RatingSelector
            label="Punctuality"
            value={ratings?.punctuality}
            onChange={(value) => handleRatingChange('punctuality', value)}
          />
          <RatingSelector
            label="Value for Money"
            value={ratings?.value}
            onChange={(value) => handleRatingChange('value', value)}
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm md:text-base font-medium text-foreground">
            Your Review *
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e?.target?.value)}
            placeholder="Share details of your experience. What did the provider do well? What could be improved?"
            className="w-full min-h-32 md:min-h-40 px-3 md:px-4 py-2 md:py-3 text-sm md:text-base bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            maxLength={1000}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-sm text-muted-foreground">
              {comment?.length}/1000 characters (minimum 20)
            </span>
            {comment?.length >= 20 && (
              <div className="flex items-center gap-1 text-success">
                <Icon name="CheckCircle2" size={14} />
                <span className="text-xs">Good length</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-3 md:p-4">
          <p className="text-xs md:text-sm font-medium text-foreground mb-2">
            Suggested topics to cover:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedTopics?.map((topic, index) => (
              <span
                key={index}
                className="px-2 md:px-3 py-1 bg-background rounded-lg text-xs md:text-sm text-muted-foreground"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>

        <PhotoUpload photos={photos} onPhotosChange={setPhotos} />

        <div className="flex items-start gap-2 p-3 md:p-4 bg-primary/10 rounded-lg">
          <Icon name="Info" size={18} color="var(--color-primary)" className="flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-foreground">
            Your review will be publicly visible and help other customers make informed decisions. Please be honest and constructive.
          </p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
        <Button
          variant="outline"
          fullWidth
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          fullWidth
          iconName="Send"
          iconPosition="right"
          onClick={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          loading={isSubmitting}
        >
          Submit Review
        </Button>
      </div>
    </div>
  );
};

export default ReviewForm;